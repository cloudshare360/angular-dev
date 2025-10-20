# Tool Scripts

Helper scripts to automate commits, track progress, and prevent data loss.

---

## 📝 Available Scripts

### 1. `auto-commit.sh`
Automatically stage, commit, and optionally push changes.

```bash
# Quick commit with default message
./tools/auto-commit.sh

# Commit with custom message
./tools/auto-commit.sh "feat: completed shopping cart"

# The script will:
# 1. Stage all changes (git add .)
# 2. Commit with your message
# 3. Ask if you want to push
# 4. Update memory.json
```

### 2. `checkpoint.sh`
Mark a day as completed and auto-commit.

```bash
# Mark Week 1, Day 1 as completed
./tools/checkpoint.sh 1 1 completed

# Mark Week 2, Day 3 as in-progress
./tools/checkpoint.sh 2 3 "in-progress"

# The script will:
# 1. Update PROGRESS.md
# 2. Commit changes
# 3. Log to conversation tracker
```

### 3. `log_conversation.js`
Log user-agent conversations for context preservation.

```bash
# Log a user message
node tools/log_conversation.js \
  --sessionId "week1-20251020" \
  --role user \
  --content "Started Day 1 exercises"

# Log an agent response
node tools/log_conversation.js \
  --sessionId "week1-20251020" \
  --role agent \
  --content "Created portfolio component"
```

### 4. `update-memory.js`
Update memory.json with metadata (used by other scripts).

```bash
node tools/update-memory.js \
  --lastCommit "abc123" \
  --message "Completed Week 1"
```

---

## 🚀 Quick Start

### Make scripts executable
```bash
chmod +x tools/*.sh
```

### Install dependencies (for Node scripts)
```bash
npm install minimist
```

### Daily workflow
```bash
# 1. Work on your code
# 2. When done with a day:
./tools/checkpoint.sh 1 1 completed

# 3. Or just quick save:
./tools/auto-commit.sh "WIP: working on forms"
```

---

## 🔒 Preventing Data Loss

### Auto-save every 30 minutes (optional)
Add to your shell profile (`~/.bashrc` or `~/.zshrc`):

```bash
# Auto-commit every 30 minutes
watch -n 1800 'cd /workspaces/angular-dev && ./tools/auto-commit.sh "auto-save"' &
```

### Git hooks
Create `.git/hooks/post-commit`:

```bash
#!/bin/bash
node tools/update-memory.js --lastCommit "$(git log -1 --format='%H')"
```

Make it executable:
```bash
chmod +x .git/hooks/post-commit
```

---

## 📊 Tracking

All scripts update:
- `PROGRESS.md` - Manual progress tracker
- `.conversations/memory.json` - Machine-readable state
- `.conversations/sessions/*.json` - Conversation logs
- Git commit history

---

## 🛠️ Customization

Edit any script to fit your workflow. They're designed to be simple and hackable.

**Common modifications**:
- Change auto-push behavior in `auto-commit.sh`
- Add Slack/Discord notifications
- Integrate with time tracking tools
- Add backup to external storage

