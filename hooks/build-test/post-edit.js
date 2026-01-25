#!/usr/bin/env node

/**
 * Post-Edit Hook: 코드 편집 후 자동 빌드/테스트
 * 
 * 실행 순서:
 * 1. Makefile/Task 정의 확인
 * 2. lint 실행 (있으면)
 * 3. build 실행 (필수)
 * 4. test 실행 (있으면)
 */

const { execSync, spawnSync } = require('child_process');
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
    runners: {
      makefile: ['make'],
      taskfile: ['task'],
      npm: ['npm', 'run'],
      pnpm: ['pnpm', 'run'],
      yarn: ['yarn'],
      bun: ['bun', 'run']
    },
    commands: {
      lint: ['lint', 'eslint', 'check'],
      build: ['build', 'compile'],
      test: ['test', 'spec']
    }
  };
}

// 프로젝트 루트 찾기
function findProjectRoot(startPath) {
  let currentPath = path.dirname(startPath);
  
  while (currentPath !== path.dirname(currentPath)) {
    const markers = ['package.json', 'Makefile', 'Taskfile.yml', 'go.mod', 'Cargo.toml'];
    for (const marker of markers) {
      if (fs.existsSync(path.join(currentPath, marker))) {
        return currentPath;
      }
    }
    currentPath = path.dirname(currentPath);
  }
  
  return null;
}

// 사용 가능한 러너 감지
function detectRunner(projectRoot) {
  const runners = [];
  
  if (fs.existsSync(path.join(projectRoot, 'Makefile'))) {
    runners.push({ type: 'makefile', cmd: ['make'] });
  }
  
  if (fs.existsSync(path.join(projectRoot, 'Taskfile.yml'))) {
    runners.push({ type: 'taskfile', cmd: ['task'] });
  }
  
  if (fs.existsSync(path.join(projectRoot, 'package.json'))) {
    // 패키지 매니저 감지
    if (fs.existsSync(path.join(projectRoot, 'pnpm-lock.yaml'))) {
      runners.push({ type: 'pnpm', cmd: ['pnpm', 'run'] });
    } else if (fs.existsSync(path.join(projectRoot, 'yarn.lock'))) {
      runners.push({ type: 'yarn', cmd: ['yarn'] });
    } else if (fs.existsSync(path.join(projectRoot, 'bun.lockb'))) {
      runners.push({ type: 'bun', cmd: ['bun', 'run'] });
    } else {
      runners.push({ type: 'npm', cmd: ['npm', 'run'] });
    }
  }
  
  return runners;
}

// 명령어 존재 여부 확인
function hasCommand(runner, command, projectRoot) {
  if (runner.type === 'makefile') {
    try {
      const result = execSync(`make -n ${command} 2>/dev/null`, { cwd: projectRoot });
      return true;
    } catch {
      return false;
    }
  }
  
  if (runner.type === 'taskfile') {
    try {
      const result = execSync(`task --list 2>/dev/null | grep -q "${command}"`, { cwd: projectRoot });
      return true;
    } catch {
      return false;
    }
  }
  
  // npm/pnpm/yarn/bun
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
    return pkg.scripts && pkg.scripts[command];
  } catch {
    return false;
  }
}

// 명령어 실행
function runCommand(runner, command, projectRoot) {
  const fullCmd = [...runner.cmd, command];
  console.log(`\n🔧 Running: ${fullCmd.join(' ')}`);
  
  const result = spawnSync(fullCmd[0], fullCmd.slice(1), {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true
  });
  
  return result.status === 0;
}

// 메인 실행
function main() {
  if (!filePath) {
    console.log('No file path provided');
    return;
  }
  
  const projectRoot = findProjectRoot(filePath);
  if (!projectRoot) {
    console.log('Could not find project root');
    return;
  }
  
  const runners = detectRunner(projectRoot);
  if (runners.length === 0) {
    console.log('No build system detected');
    return;
  }
  
  const runner = runners[0]; // 첫 번째 러너 사용
  const config = loadConfig();
  
  console.log(`\n📁 Project: ${projectRoot}`);
  console.log(`🔨 Runner: ${runner.type}`);
  
  // 1. Lint
  for (const cmd of config.commands.lint) {
    if (hasCommand(runner, cmd, projectRoot)) {
      if (!runCommand(runner, cmd, projectRoot)) {
        console.log('\n❌ Lint failed');
        process.exit(1);
      }
      break;
    }
  }
  
  // 2. Build
  let buildRan = false;
  for (const cmd of config.commands.build) {
    if (hasCommand(runner, cmd, projectRoot)) {
      if (!runCommand(runner, cmd, projectRoot)) {
        console.log('\n❌ Build failed');
        process.exit(1);
      }
      buildRan = true;
      break;
    }
  }
  
  if (!buildRan) {
    console.log('\n⚠️ No build command found');
  }
  
  // 3. Test
  for (const cmd of config.commands.test) {
    if (hasCommand(runner, cmd, projectRoot)) {
      if (!runCommand(runner, cmd, projectRoot)) {
        console.log('\n❌ Tests failed');
        process.exit(1);
      }
      break;
    }
  }
  
  console.log('\n✅ All checks passed');
}

main();
