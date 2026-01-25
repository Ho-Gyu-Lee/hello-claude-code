#!/usr/bin/env node

/**
 * Suggest Compact Hook
 * 컨텍스트가 커지면 컴팩션을 제안합니다.
 */

function suggestCompact() {
  console.log('\n⚠️ Context window is getting large\n');
  console.log('Consider compacting the conversation to maintain performance.\n');
  console.log('Suggestions:');
  console.log('  1. Summarize completed tasks');
  console.log('  2. Remove resolved discussions');
  console.log('  3. Keep only active context');
  console.log('\nUse /compact to manually compact, or continue and I will auto-compact.\n');
}

function main() {
  suggestCompact();
}

main();
