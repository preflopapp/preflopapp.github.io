#!/bin/sh
# Render scripts/og-card.html to assets/og-v2.png (1200×630) with headless Chrome,
# and copy it to assets/og.png, which /landing/'s imported metadata still uses.
# Usage: scripts/render-og.sh   (set CHROME to override the browser path)
set -eu
cd "$(dirname "$0")/.."
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --allow-file-access-from-files --virtual-time-budget=3000 \
  --window-size=1200,630 --screenshot="$PWD/assets/og-v2.png" "file://$PWD/scripts/og-card.html" 2>/dev/null
cp assets/og-v2.png assets/og.png
echo "Wrote assets/og-v2.png (and its copy, assets/og.png)"
