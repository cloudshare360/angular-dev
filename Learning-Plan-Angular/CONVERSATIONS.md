# Conversation Tracking Guide

This project includes a lightweight conversation tracking system to persist chat history and memory needed to continue multi-step activities.

Location
- `.conversations/` — session files, index, schema, and memory
- `tools/log_conversation.js` — helper script to append messages and update memory

Quick usage

```bash
# Append a user message to a session (creates session if missing)
node tools/log_conversation.js --sessionId session-20251020-0001 --role user --content "Continue Week 2 scaffolding"

# Append an agent message
node tools/log_conversation.js --sessionId session-20251020-0001 --role agent --content "Scaffolded Week 2 folders"
```

Notes
- Files are JSON and safe to commit (avoid secrets)
- `memory.json` stores minimal, persistent key/value pairs to resume context
- See `.conversations/schema.json` for session structure

Recommended workflow
1. Start a session ID for a focused task (e.g., `week2-20251020`) and reuse it while working.
2. After each important chat turn, append the message to the session using the helper.
3. Periodically export or snapshot sessions if needed for audits.

