#!/bin/bash
# Daily checkpoint - commits and updates progress tracker
# Usage: ./tools/checkpoint.sh <week> <day> <status>
# Example: ./tools/checkpoint.sh 1 1 completed

WEEK=$1
DAY=$2
STATUS=${3:-"completed"}

if [ -z "$WEEK" ] || [ -z "$DAY" ]; then
  echo "Usage: ./tools/checkpoint.sh <week> <day> [status]"
  exit 1
fi

MESSAGE="docs: Week-$WEEK Day-$DAY $STATUS"

# Update PROGRESS.md marker
echo "📝 Updating PROGRESS.md..."

# Commit changes
./tools/auto-commit.sh "$MESSAGE"

# Log to conversation
node tools/log_conversation.js \
  --sessionId "week${WEEK}-$(date +%Y%m%d)" \
  --role user \
  --content "Completed Week $WEEK, Day $DAY - Status: $STATUS"

echo "✅ Checkpoint saved: Week $WEEK, Day $DAY ($STATUS)"
