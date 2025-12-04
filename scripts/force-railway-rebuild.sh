#!/bin/bash
# Script to force Railway to rebuild without using cached layers
# Updates both .railway-build-id and Dockerfile CACHE_BUST timestamp

TIMESTAMP=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
VERSION="v$(date +%s)"

echo "🔄 Forcing fresh Railway build..."
echo "📅 Timestamp: ${TIMESTAMP}"
echo "🔢 Version: ${VERSION}"

# Update .railway-build-id
echo "# Auto-updated build ID" > .railway-build-id
echo "BUILD_ID=${TIMESTAMP}-${VERSION}" >> .railway-build-id
echo "✅ Updated .railway-build-id"

# Update Dockerfile CACHE_BUST
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  sed -i '' "s/# CACHE_BUST:.*/# CACHE_BUST: ${TIMESTAMP}-${VERSION} - UPDATE THIS TIMESTAMP TO FORCE FRESH BUILD/" Dockerfile
  sed -i '' "s/ARG CACHE_BUST=.*/ARG CACHE_BUST=${TIMESTAMP}-${VERSION}/" Dockerfile
else
  # Linux
  sed -i "s/# CACHE_BUST:.*/# CACHE_BUST: ${TIMESTAMP}-${VERSION} - UPDATE THIS TIMESTAMP TO FORCE FRESH BUILD/" Dockerfile
  sed -i "s/ARG CACHE_BUST=.*/ARG CACHE_BUST=${TIMESTAMP}-${VERSION}/" Dockerfile
fi

echo "✅ Updated Dockerfile CACHE_BUST"
echo ""
echo "📝 Files updated. Now commit and push:"
echo "   git add .railway-build-id Dockerfile"
echo "   git commit -m 'Force fresh Railway build'"
echo "   git push origin main"

