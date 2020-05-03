#!/usr/bin/env bash

# Extract attachments from gmail mbox exported from Thunderbird
# $1: input dir
# $2: output dir

mkdir -p "$2"
for file in "$1"/messages/*/*; do
    out="${file##*messages/}"
    cp -nv "$file" "$2/${out/\//-}"
done