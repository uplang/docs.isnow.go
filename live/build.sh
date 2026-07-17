#!/usr/bin/env bash
# Rebuild the live-docs enhancer bundle (static/js/isnow-live.js) from
# live/enhance.js plus the sibling @tsvsheet/isnow engine. The bundle is committed
# so the Hugo site needs no build toolchain; run this only when enhance.js or the
# isnow.js engine changes. Uses the esbuild already vendored by ../../isnow.js.
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
esbuild="${here}/../../isnow.js/node_modules/.bin/esbuild"
if [[ ! -x "${esbuild}" ]]; then
  esbuild="$(command -v esbuild)"
fi

"${esbuild}" "${here}/enhance.js" \
  --bundle --format=esm --platform=browser --target=es2022 \
  --minify --legal-comments=none \
  --outfile="${here}/../static/js/isnow-live.js"

echo "built static/js/isnow-live.js"
