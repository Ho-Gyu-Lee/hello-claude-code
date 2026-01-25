#!/usr/bin/env node

/**
 * Session Start Hook
 * 세션 시작 시 이전 컨텍스트를 로드합니다.
 */

const fs = require('fs');
const path = require('path');

const MEMORY_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.claude', 'memory');
const SESSION_FILE = path.join(MEMORY_DIR, 'last-session.json');

function loadSession() {
  try {
    if (!fs.existsSync(SESSION_FILE)) {
      console.log('No previous session found');
      return null;
    }

    const data = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
    
    console.log('Previous session loaded:');
    console.log(`- Project: ${data.project || 'Unknown'}`);
    console.log(`- Last activity: ${data.lastActivity || 'Unknown'}`);
    console.log(`- Context items: ${data.context?.length || 0}`);

    return data;
  } catch (error) {
    console.error('Failed to load session:', error.message);
    return null;
  }
}

function main() {
  console.log('\n📂 Loading previous session...\n');
  
  const session = loadSession();
  
  if (session && session.context) {
    console.log('\nContext summary:');
    session.context.slice(0, 5).forEach((item, i) => {
      console.log(`  ${i + 1}. ${item.type}: ${item.summary || item.name}`);
    });
    
    if (session.context.length > 5) {
      console.log(`  ... and ${session.context.length - 5} more items`);
    }
  }
  
  console.log('\n✅ Session ready\n');
}

main();
