#!/usr/bin/env bash

# Find all cassette recordings and convert to mono
FILES="$(find . -name '*.m4a')"
while read IN; do
    echo "$IN: Stereo -> Mono"
    ffmpeg -i "$IN" -vcodec copy -af "pan:mono|c0=c0" "$IN.tmp"
    mv "$IN" "${IN%.m4a}.stereo.m4a"
    mv "$IN.tmp" "$IN"
done <<< "$FILES"