#!/usr/bin/env node
/*
 Update memory.json with latest progress
 Usage: node tools/update-memory.js --lastCommit <hash> --message <msg>
*/

const fs = require('fs');
const path = require('path');

const args = require('minimist')(process.argv.slice(2));
const memoryFile = path.resolve(__dirname, '../.conversations/memory.json');

let memory = {};
if (fs.existsSync(memoryFile)) {
  memory = JSON.parse(fs.readFileSync(memoryFile, 'utf8'));
}

// Update memory
memory.lastCommit = args.lastCommit || memory.lastCommit;
memory.lastCommitMessage = args.message || memory.lastCommitMessage;
memory.updatedAt = new Date().toISOString();

// Increment session counter if needed
if (!memory.sessionCount) memory.sessionCount = 0;
memory.sessionCount++;

fs.writeFileSync(memoryFile, JSON.stringify(memory, null, 2));
console.log('✅ Memory updated');
