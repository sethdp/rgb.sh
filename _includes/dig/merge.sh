#!/usr/bin/env bash

# Merge all .mp4's under $1/ into $1.mp4 in default order (for DVD scenes)
# $1: input dir

in="$(
for file in "$1"/*.mp4; do
    echo "file '$PWD/$file'";
done)"
out="$(basename "$1")".mp4
ffmpeg -f concat -safe 0 -i <(echo "$in") -c copy "$out"
