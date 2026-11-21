#!/usr/bin/env bash
set -euo pipefail

# package-extension.sh — Creates a clean ZIP for Chrome Web Store submission

EXTENSION_NAME="pinnit"
VERSION=$(node -e "console.log(JSON.parse(require('fs').readFileSync('./manifest.json')).version)")
OUTPUT="${EXTENSION_NAME}-v${VERSION}.zip"

echo "Packaging ${EXTENSION_NAME} version ${VERSION}..."

# Remove old package if it exists
rm -f "${OUTPUT}"

# Create clean ZIP excluding dev, documentation, and promotional files
zip -r "${OUTPUT}" . \
  -x ".git/*" \
  -x ".github/*" \
  -x ".gitignore" \
  -x "node_modules/*" \
  -x ".env*" \
  -x "*.zip" \
  -x "package-extension.sh" \
  -x "CHROMEWEBSTORE.md" \
  -x "README.md" \
  -x "PRIVACY.md" \
  -x "LICENSE" \
  -x "store-assets/*" \
  -x ".DS_Store" \
  -x "*/.DS_Store" \
  -x "Thumbs.db" \
  -x "*.sh" \
  -x "*.log"

echo "----------------------------------------"
echo "Successfully packaged: ${OUTPUT} ($(du -h "${OUTPUT}" | cut -f1))"
echo "Package contents:"
unzip -l "${OUTPUT}"
echo "----------------------------------------"
