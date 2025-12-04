#!/bin/bash
# Script to automatically update the CACHE_BUST value in Dockerfile
# This forces Railway to rebuild without using cached layers

TIMESTAMP=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
CACHE_BUST_VALUE="${TIMESTAMP}-auto-update"

# Update Dockerfile with new cache bust value
sed -i.bak "s/ARG CACHE_BUST=.*/ARG CACHE_BUST=${CACHE_BUST_VALUE}/" Dockerfile

echo "Updated CACHE_BUST to: ${CACHE_BUST_VALUE}"
echo "Dockerfile has been updated. Commit this change to trigger a fresh Railway build."

