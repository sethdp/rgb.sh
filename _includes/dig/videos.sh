#!/usr/bin/env bash

# Find and convert all MOD, wmv and DVD videos to mp4
# $1: input dir

shopt -s globstar nullglob # requires bash 4
for file in "$1"/**/*.{MOD,VOB,wmv}; do
    out="$(echo "$file" | sed 's/VIDEO_TS\///')"
    ffmpeg -i "$file" "${out%.*}".mp4
done
