#!/usr/bin/env node

/**
 * Pre-Compact Hook
 * 컴팩션 전 중요 상태를 저장합니다.
 */

const fs = require('fs');
const path = require('path');

const MEMORY_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.claude', 'memory');
const COMPACT_FILE = path.join(MEMORY_DIR, 'pre-compact-state.json');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function savePreCompactState() {
  try {
    ensureDir(MEMORY_DIR);

    const state = {
      savedAt: new Date().toISOString(),
      reason: 'pre_compact',
      project: process.cwd(),
      notes: [
        'Context was compacted',
        'Review this file to restore important context'
      ]
    };

    fs.writeFileSync(COMPACT_FILE, JSON.stringify(state, null, 2));
    
    console.log('Pre-compact state saved');
    return true;
  } catch (error) {
    console.error('Failed to save pre-compact state:', error.message);
    return false;
  }
}

function main() {
  console.log('\n📦 Saving pre-compact state...\n');
  savePreCompactState();
  console.log('✅ Done\n');
}

main();
