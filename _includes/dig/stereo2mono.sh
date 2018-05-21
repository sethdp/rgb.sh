#!/usr/bin/env bash
FILES="$(find . -name '*.mp4')"
while read IN; do
    echo "${IN}: Stereo -> Mono"
    ffmpeg -i "$IN" -vcodec copy -af "pan:mono|c0=c0" "${IN}.tmp"
    mv "$IN" "${IN%.mp4}.stereo.mp4"
    mv "${IN}.tmp" "${IN}"
done <<< "$FILES"
