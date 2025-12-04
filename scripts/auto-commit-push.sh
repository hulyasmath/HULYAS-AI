#!/bin/bash

# Auto-commit and push script
# This script stages all changes, commits, and pushes to trigger Railway deployment

set -e

echo "🔄 Auto-committing and pushing changes..."

# Get current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Check for changes
if [ -z "$(git status --porcelain)" ]; then
  echo "✅ No changes to commit."
  exit 0
fi

# Stage all changes
echo "📦 Staging all changes..."
git add -A

# Generate commit message
if [ -z "$1" ]; then
  COMMIT_MSG="chore: auto-commit $(date +'%Y-%m-%d %H:%M:%S')"
else
  COMMIT_MSG="$1"
fi

# Commit
echo "💾 Committing: $COMMIT_MSG"
git commit -m "$COMMIT_MSG"

# Push (this triggers Railway auto-deployment)
echo "🚢 Pushing to GitHub..."
git push origin "$BRANCH"

echo ""
echo "✅ Changes pushed! Railway will auto-deploy..."
echo ""

