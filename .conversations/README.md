# Conversation Tracking

This folder stores structured conversation logs, session metadata, and memory entries to preserve user-agent interactions for the `angular-dev` workspace.

Purpose
- Keep an auditable log of chat interactions between the user and the coding agent.
- Store context and memory items required to continue large multi-step tasks across sessions.
- Provide a simple helper to append and read logs locally.

Structure
```
.conversations/
├── index.json           # Index of sessions and quick metadata
├── schema.json          # JSON Schema describing session file structure
├── sessions/
│   ├── session-<ts>-<id>.json  # Individual session files
│   └── sample-session.json     # Example session
└── memory.json          # Persistent key/value memory for tasks
```

Notes
- These files are intended to be edited by the helper script `tools/log_conversation.js` or manually if necessary.
- Avoid storing secrets in these files.
- Use ISO 8601 timestamps.

```