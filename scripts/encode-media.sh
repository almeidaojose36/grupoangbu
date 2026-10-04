#!/usr/bin/env bash
# Re-encodes the company and hero background clips in public/media for the web:
# light denoise (AI footage noise costs bits), CRF 28, no audio, faststart.
# Same settings as the journey video in build-journey.py, which is left alone.
#
#   scripts/encode-media.sh                 # every <key>.mp4 and <key>-720.mp4
#   scripts/encode-media.sh public/media/atc.mp4
set -euo pipefail
cd "$(dirname "$0")/.."

files=("$@")
[ ${#files[@]} -eq 0 ] && files=(public/media/*.mp4)

for f in "${files[@]}"; do
    tmp="${f%.mp4}.tmp.mp4"
    ffmpeg -v error -y -i "$f" -vf 'hqdn3d=2:1.5:5:5,format=yuv420p' -an \
        -c:v libx264 -preset slow -tune film -crf 28 -profile:v high -movflags +faststart "$tmp"
    # Keep the original when the re-encode would not be meaningfully smaller.
    if [ "$(stat -c%s "$tmp")" -lt $(( $(stat -c%s "$f") * 9 / 10 )) ]; then
        echo "$f: $(du -h "$f" | cut -f1) -> $(du -h "$tmp" | cut -f1)"
        mv "$tmp" "$f"
    else
        echo "$f: kept ($(du -h "$f" | cut -f1))"
        rm "$tmp"
    fi
done
