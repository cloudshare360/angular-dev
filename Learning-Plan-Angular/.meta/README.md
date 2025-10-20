# .meta/ Directory - Project Tracking & Context Preservation

This directory contains metadata, tracking, and context preservation files for the **Angular 18 Learning Plan** project.

---

## 📁 Files in This Directory

### 1. `session-tracker.json`
**Purpose**: Structured, machine-readable tracking of all sessions, requests, and outputs.

**Contains**:
- Project metadata (name, version, repository)
- Session history with timestamps
- User requests and agent responses
- File creation tracking
- Completion status per week/day

**Use When**:
- Need to query specific session data programmatically
- Want to restore agent context with structured data
- Need to track what files were created when

---

### 2. `conversation-log.md`
**Purpose**: Human-readable conversation history and narrative log.

**Contains**:
- Chronological conversation entries
- User requests with timestamps
- Agent actions and deliverables
- Context notes and decisions
- Next actions required

**Use When**:
- Resuming work after a break
- Need to understand WHY decisions were made
- Want a narrative of the project evolution
- Onboarding new team members

---

### 3. `context-memory.json`
**Purpose**: AI context preservation for continuity across sessions.

**Contains**:
- Project context and goals
- Technical stack details
- Weekly breakdown structure
- Current state and next actions
- User preferences and conventions
- AI instructions for restoration

**Use When**:
- AI agent needs to restore full context
- Want to understand project structure quickly
- Need to know technical decisions and patterns
- Planning next steps based on current state

---

### 4. `progress-tracker.md`
**Purpose**: Visual progress dashboard and quick status overview.

**Contains**:
- Overall progress percentage
- Week-by-week status table
- Detailed file structure with checkboxes
- Recent activity log
- Next steps prioritized
- Completion metrics

**Use When**:
- Need a quick visual status update
- Want to see what's completed vs pending
- Planning next work sessions
- Reporting progress to stakeholders

---

## 🔄 How These Files Work Together

```
┌─────────────────────────────────────────────────────────┐
│                    User Interaction                      │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│              conversation-log.md                         │
│        (Human reads: What happened? Why?)                │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│              session-tracker.json                        │
│    (Machine reads: Structured data, timestamps)          │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│              context-memory.json                         │
│     (AI reads: Restore full context, preferences)        │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│              progress-tracker.md                         │
│        (Everyone reads: Visual status dashboard)         │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 Update Protocol

### After Each Session
1. **Update `session-tracker.json`**: Add new requests, outputs, timestamps
2. **Append to `conversation-log.md`**: Add narrative of what happened
3. **Update `context-memory.json`**: Refresh currentState and nextAction
4. **Sync `progress-tracker.md`**: Mark completed items, update percentages

### When Resuming Work
1. **Read `progress-tracker.md`** first for quick status
2. **Read `conversation-log.md`** for context and history
3. **Check `context-memory.json`** for next actions
4. Continue work and update all files when done

---

## 🎯 Best Practices

1. **Keep files synchronized**: Update all four files together
2. **Use timestamps**: Always include ISO 8601 timestamps
3. **Be detailed**: Future you (or future AI) will thank you
4. **Version control**: Commit these files regularly
5. **Don't delete**: Keep history; append only

---

## 🚨 Important Notes

- **Do not edit manually** unless you understand the structure
- **Always commit** these files with your code changes
- **Review before resuming**: Always check these files before continuing work
- **Update after batches**: Don't wait until end of day; update after each meaningful batch

---

## 🔗 Related Files

- `../readme.md` - Main learning plan overview
- `../Week-XX-*/README.md` - Weekly content files
- `../Week-XX-*/Day-XX-*/README.md` - Daily lesson files

---

## 📞 Support

If files become out of sync or corrupted:
1. Check Git history for last good state
2. Restore from backup
3. Manually reconcile differences
4. Update all four files to match

---

*This directory is essential for project continuity. Treat it with care!*
