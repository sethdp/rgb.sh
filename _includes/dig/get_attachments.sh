#!/usr/bin/env bash
for dir in *.mbox*/; do
    out="${dir%%.mbox*}"
    mkdir -p "$out"
    for input in {"${dir}messages/Attachments"*/*,"${dir}messages/EmbeddedImages"*/*}; do
        in_folder="${input##*messages/}"
        out_file="${in_folder/\//-}"
        cp -nv "$input" "$out/$out_file"
    done
done
