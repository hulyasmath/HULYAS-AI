#!/bin/bash
# Create minimal 1x1 pixel PNG files that Chrome will accept
cd icons

# Create base64-encoded minimal PNG (1x1 transparent pixel)
# This is a valid PNG that Chrome will accept
BASE64_PNG="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

for size in 16 48 128; do
  echo "$BASE64_PNG" | base64 -d > "icon${size}.png"
  echo "Created icon${size}.png"
done
