#!/usr/bin/env node

/**
 * Post-Edit Hook: 코드 편집 후 자동 빌드/테스트
 *
 * 지원 빌드 시스템:
 * - Make/CMake (C/C++)
 * - Cargo (Rust)
 * - Go modules
 * - .NET (C#)
 * - Python (pytest, unittest)
 * - Task (범용)
 *
 * 실행 순서: lint → build → test
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];

// 설정 파일 로드
function loadConfig() {
  const configPath = path.join(__dirname, 'config.json');
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
  return getDefaultConfig();
}

function getDefaultConfig() {
  return {
    projectMarkers: {
      makefile: ['Makefile', 'GNUmakefile'],
      cmake: ['CMakeLists.txt'],
      cargo: ['Cargo.toml'],
      go: ['go.mod'],
      dotnet: ['*.csproj', '*.sln'],
      python: ['pyproject.toml', 'setup.py']
    }
  };
}

// 프로젝트 루트 및 타입 찾기
function findProject(startPath) {
  const config = loadConfig();
  let currentPath = path.dirname(startPath);

  while (currentPath !== path.dirname(currentPath)) {
    // 우선순위대로 확인
    const checks = [
      { type: 'cargo', files: ['Cargo.toml'] },
      { type: 'go', files: ['go.mod'] },
      { type: 'cmake', files: ['CMakeLists.txt'] },
      { type: 'makefile', files: ['Makefile', 'GNUmakefile'] },
      { type: 'dotnet', files: ['*.csproj', '*.sln'] },
      { type: 'python', files: ['pyproject.toml', 'setup.py'] },
      { type: 'taskfile', files: ['Taskfile.yml', 'Taskfile.yaml'] }
    ];

    for (const check of checks) {
      for (const file of check.files) {
        if (file.includes('*')) {
          // glob 패턴 처리
          const pattern = file.replace('*', '');
          const files = fs.readdirSync(currentPath);
          if (files.some(f => f.endsWith(pattern))) {
            return { root: currentPath, type: check.type };
          }
        } else if (fs.existsSync(path.join(currentPath, file))) {
          return { root: currentPath, type: check.type };
        }
      }
    }
    currentPath = path.dirname(currentPath);
  }

  return null;
}

// 명령어 실행
function runCommand(cmd, args, cwd, description) {
  console.log(`\n🔧 ${description}: ${cmd} ${args.join(' ')}`);

  const result = spawnSync(cmd, args, {
    cwd: cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });

  return result.status === 0;
}

// Make 타겟 존재 확인
function hasMakeTarget(target, cwd) {
  const result = spawnSync('make', ['-n', target], {
    cwd: cwd,
    stdio: 'pipe',
    shell: process.platform === 'win32'
  });
  return result.status === 0;
}

// 빌드 시스템별 실행
function runBuildSystem(project) {
  const { root, type } = project;

  switch (type) {
    case 'cargo':
      return runCargo(root);
    case 'go':
      return runGo(root);
    case 'cmake':
      return runCMake(root);
    case 'makefile':
      return runMake(root);
    case 'dotnet':
      return runDotnet(root);
    case 'python':
      return runPython(root);
    case 'taskfile':
      return runTask(root);
    default:
      console.log('⚠️ Unknown build system');
      return true;
  }
}

function runCargo(cwd) {
  // cargo clippy (lint)
  if (!runCommand('cargo', ['clippy', '--', '-D', 'warnings'], cwd, 'Lint')) {
    return false;
  }
  // cargo build
  if (!runCommand('cargo', ['build'], cwd, 'Build')) {
    return false;
  }
  // cargo test
  return runCommand('cargo', ['test'], cwd, 'Test');
}

function runGo(cwd) {
  // go vet (lint)
  if (!runCommand('go', ['vet', './...'], cwd, 'Lint')) {
    return false;
  }
  // go build
  if (!runCommand('go', ['build', './...'], cwd, 'Build')) {
    return false;
  }
  // go test
  return runCommand('go', ['test', './...'], cwd, 'Test');
}

function runCMake(cwd) {
  const buildDir = path.join(cwd, 'build');

  // cmake 빌드 디렉토리 없으면 생성
  if (!fs.existsSync(buildDir)) {
    if (!runCommand('cmake', ['-B', 'build', '-S', '.'], cwd, 'Configure')) {
      return false;
    }
  }

  // build
  if (!runCommand('cmake', ['--build', 'build'], cwd, 'Build')) {
    return false;
  }

  // test (ctest)
  return runCommand('ctest', ['--test-dir', 'build', '--output-on-failure'], cwd, 'Test');
}

function runMake(cwd) {
  // lint (있으면)
  if (hasMakeTarget('lint', cwd)) {
    if (!runCommand('make', ['lint'], cwd, 'Lint')) {
      return false;
    }
  }

  // build
  if (!runCommand('make', [], cwd, 'Build')) {
    return false;
  }

  // test (있으면)
  if (hasMakeTarget('test', cwd)) {
    return runCommand('make', ['test'], cwd, 'Test');
  }

  return true;
}

function runDotnet(cwd) {
  // build
  if (!runCommand('dotnet', ['build'], cwd, 'Build')) {
    return false;
  }
  // test
  return runCommand('dotnet', ['test'], cwd, 'Test');
}

function runPython(cwd) {
  // pytest 존재 확인
  const hasPytest = fs.existsSync(path.join(cwd, 'pytest.ini')) ||
                    fs.existsSync(path.join(cwd, 'pyproject.toml'));

  if (hasPytest) {
    return runCommand('python', ['-m', 'pytest'], cwd, 'Test');
  }

  // unittest fallback
  return runCommand('python', ['-m', 'unittest', 'discover'], cwd, 'Test');
}

function runTask(cwd) {
  // task default
  return runCommand('task', [], cwd, 'Task');
}

// 스킵 패턴 확인
function shouldSkip(filePath) {
  const config = loadConfig();
  const skipPatterns = config.skipPatterns || [];
  const fileName = path.basename(filePath);

  return skipPatterns.some(pattern => {
    const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
    return regex.test(fileName);
  });
}

// 메인 실행
function main() {
  if (!filePath) {
    console.log('No file path provided');
    return;
  }

  if (shouldSkip(filePath)) {
    console.log('⏭️ Skipped (non-code file)');
    return;
  }

  const project = findProject(filePath);
  if (!project) {
    console.log('Could not find project root');
    return;
  }

  console.log(`\n📁 Project: ${project.root}`);
  console.log(`🔨 Type: ${project.type}`);

  if (runBuildSystem(project)) {
    console.log('\n✅ All checks passed');
  } else {
    console.log('\n❌ Check failed');
    process.exit(1);
  }
}

main();
