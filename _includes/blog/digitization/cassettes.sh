#!/usr/bin/env bash

# Remove video channel from cassette recordings and convert to mono
# $1: input dir
# $2: output dir

shopt -s globstar #requires bash 4
for file in "$1"/**/*.mp4; do
    out="$2/${file#$1}"
    mkdir -p "$(dirname "$out")"
    ffmpeg -i "$file" -vn -af "pan=mono|c0=c0" "${out%%.mp4}.m4a"
done