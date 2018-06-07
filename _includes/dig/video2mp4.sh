#!/usr/bin/env bash
VIDS="$(find . -name '*.MOD' -or -name '*.wmv' -or -name '*.VOB')"
while read IN; do
    OUT="$(sed 's/VIDEO_TS\///' <<< "$IN")"
    OUT="${OUT#./}"
    OUT="Videos/${OUT%.*}.mp4"
    echo "$IN -> $OUT"
    mkdir -p "${OUT%/*}"
    ffmpeg -i "$IN" "$OUT"
done <<< "$VIDS"
