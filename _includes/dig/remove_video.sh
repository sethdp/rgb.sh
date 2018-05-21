#!/usr/bin/env bash
FILES="$(find . -name '.mp4')"
while read IN; do
    OUT="${IN%.mp4}.aac"
    echo "${IN} -> ${OUT}"
    ffmpeg -i "$IN" -c copy "$OUT"
done <<< "$FILES"
