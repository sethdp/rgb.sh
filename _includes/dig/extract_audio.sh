#!/usr/bin/env bash

# Remove video channel from cassette recordings
FILES="$(find . -name '.mp4')"
while read IN; do
    OUT="${IN%.mp4}.m4a"
    echo "$IN -> $OUT"
    ffmpeg -i "$IN" -c copy "$OUT"
done <<< "$FILES"