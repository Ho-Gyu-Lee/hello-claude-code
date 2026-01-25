#!/usr/bin/env node

/**
 * Session End Hook
 * 세션 종료 시 상태를 저장합니다.
 */

const fs = require('fs');
const path = require('path');

const MEMORY_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.claude', 'memory');
const SESSION_FILE = path.join(MEMORY_DIR, 'last-session.json');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function saveSession() {
  try {
    ensureDir(MEMORY_DIR);

    const sessionData = {
      savedAt: new Date().toISOString(),
      project: process.cwd(),
      lastActivity: 'session_end',
      context: []
    };

    // 현재 작업 디렉토리의 최근 파일들 기록
    try {
      const files = fs.readdirSync(process.cwd())
        .filter(f => !f.startsWith('.'))
        .slice(0, 10);
      
      sessionData.context = files.map(f => ({
        type: 'file',
        name: f,
        summary: `File in project root`
      }));
    } catch (e) {
      // 무시
    }

    fs.writeFileSync(SESSION_FILE, JSON.stringify(sessionData, null, 2));
    
    console.log('Session saved successfully');
    console.log(`- Location: ${SESSION_FILE}`);
    console.log(`- Items: ${sessionData.context.length}`);

    return true;
  } catch (error) {
    console.error('Failed to save session:', error.message);
    return false;
  }
}

function main() {
  console.log('\n💾 Saving session...\n');
  
  const success = saveSession();
  
  if (success) {
    console.log('\n✅ Session saved\n');
  } else {
    console.log('\n⚠️ Session save failed\n');
  }
}

main();
