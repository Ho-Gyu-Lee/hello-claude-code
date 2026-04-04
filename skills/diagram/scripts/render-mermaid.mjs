#!/usr/bin/env node
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..', '..', '..');
const pkgDir = resolve(projectRoot, 'node_modules', 'beautiful-mermaid');

if (!existsSync(pkgDir)) {
  console.error('[diagram] beautiful-mermaid not found. Installing...');
  execSync('npm install --no-save beautiful-mermaid', { cwd: projectRoot, stdio: 'inherit' });
}

const { renderMermaidASCII } = await import(resolve(pkgDir, 'dist', 'index.js'));

const input = process.argv[2];

if (!input) {
  const chunks = [];
  process.stdin.setEncoding('utf8');
  for await (const chunk of process.stdin) chunks.push(chunk);
  const code = chunks.join('');
  if (!code.trim()) {
    console.error('Usage: render-mermaid.mjs <mermaid-code>');
    console.error('       echo "graph LR\\n  A --> B" | render-mermaid.mjs');
    process.exit(1);
  }
  console.log(renderMermaidASCII(code));
} else {
  console.log(renderMermaidASCII(input));
}
