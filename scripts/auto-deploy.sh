#!/bin/bash

# Auto-deploy script for Railway
# This script commits all changes and pushes to GitHub, triggering Railway auto-deployment

set -e  # Exit on error

echo "🚀 Starting auto-deploy to Railway..."

# Get the current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ "$BRANCH" != "main" ]; then
  echo "⚠️  Warning: Not on main branch. Current branch: $BRANCH"
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deploy cancelled"
    exit 1
  fi
fi

# Check for uncommitted changes
if [ -z "$(git status --porcelain)" ]; then
  echo "✅ No changes to commit. Everything is up to date."
  exit 0
fi

# Show what will be committed
echo "📋 Changes to be committed:"
git status --short

# Ask for commit message
if [ -z "$1" ]; then
  echo ""
  read -p "Enter commit message (or press Enter for auto-generated): " COMMIT_MSG
  if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="chore: auto-deploy $(date +'%Y-%m-%d %H:%M:%S')"
  fi
else
  COMMIT_MSG="$1"
fi

# Stage all changes
echo "📦 Staging all changes..."
git add -A

# Commit
echo "💾 Committing changes..."
git commit -m "$COMMIT_MSG"

# Push to GitHub (this triggers Railway auto-deployment)
echo "🚢 Pushing to GitHub (this will trigger Railway deployment)..."
git push origin "$BRANCH"

echo ""
echo "✅ Successfully pushed to GitHub!"
echo "🔄 Railway will automatically detect the new commit and start deploying..."
echo ""
echo "📊 Monitor deployment at: https://railway.app"
echo ""

