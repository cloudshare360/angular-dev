#!/bin/bash
# Auto-commit helper script for learning progress
# Usage: ./tools/auto-commit.sh "Week-1 Day-1 completed"

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default message if none provided
MESSAGE="${1:-"docs: auto-save learning progress"}"

echo -e "${BLUE}🔄 Auto-committing changes...${NC}"

# Stage all changes
git add .

# Check if there are changes to commit
if git diff-staged --quiet; then
  echo -e "${GREEN}✅ No changes to commit${NC}"
  exit 0
fi

# Commit with message
git commit -m "$MESSAGE"

echo -e "${GREEN}✅ Changes committed: $MESSAGE${NC}"

# Ask if user wants to push
read -p "Push to remote? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  git push origin main
  echo -e "${GREEN}✅ Pushed to remote${NC}"
fi

# Update memory.json with last commit
cd "$(dirname "$0")/.."
node tools/update-memory.js --lastCommit "$(git log -1 --format='%H')" --message "$MESSAGE"

echo -e "${GREEN}✅ All done!${NC}"
