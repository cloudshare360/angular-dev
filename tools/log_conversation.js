#!/usr/bin/env node
/*
 Helper to append conversation messages to a session file and update index.json and memory.json
 Usage:
   node tools/log_conversation.js --sessionId sample-20251020-0001 --role user --content "My message"
*/

const fs = require('fs');
const path = require('path');

function isoNow() { return new Date().toISOString(); }

const args = require('minimist')(process.argv.slice(2));
const sessionId = args.sessionId || `session-${Date.now()}`;
const role = args.role || 'user';
const content = args.content || '';

const base = path.resolve(__dirname, '..');
const convDir = path.join(base, '.conversations');
const sessionsDir = path.join(convDir, 'sessions');
const indexFile = path.join(convDir, 'index.json');
const memoryFile = path.join(convDir, 'memory.json');

if (!fs.existsSync(convDir)) fs.mkdirSync(convDir);
if (!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir);

let index = { generatedAt: isoNow(), sessions: [] };
if (fs.existsSync(indexFile)) index = JSON.parse(fs.readFileSync(indexFile,'utf8'));

let sessionFile = path.join(sessionsDir, `${sessionId}.json`);
let session = null;
if (fs.existsSync(sessionFile)) {
  session = JSON.parse(fs.readFileSync(sessionFile,'utf8'));
  session.updatedAt = isoNow();
} else {
  session = { sessionId, createdAt: isoNow(), updatedAt: isoNow(), user: { id: 'user-1' }, messages: [], metadata: { project: 'angular-dev' } };
}

session.messages.push({ role, content, timestamp: isoNow() });
fs.writeFileSync(sessionFile, JSON.stringify(session, null, 2));

// Update index
const existing = index.sessions.find(s => s.sessionId === sessionId);
if (!existing) index.sessions.push({ sessionId, createdAt: session.createdAt, updatedAt: session.updatedAt, filename: `sessions/${sessionId}.json` });
else existing.updatedAt = session.updatedAt;
index.generatedAt = isoNow();
fs.writeFileSync(indexFile, JSON.stringify(index, null, 2));

// Update memory
let memory = { lastSessionId: sessionId };
if (fs.existsSync(memoryFile)) memory = JSON.parse(fs.readFileSync(memoryFile,'utf8'));
memory.lastSessionId = sessionId;
memory.updatedAt = isoNow();
fs.writeFileSync(memoryFile, JSON.stringify(memory, null, 2));

console.log(`Appended message to ${sessionFile}`);
