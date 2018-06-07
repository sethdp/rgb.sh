#!/usr/bin/env bash

ffmpeg -f concat -safe 0 -i <(for f in "${1}/*.mp4"; do echo "file '$PWD/$f'"; done) -c copy "${1}/merged.mp4"
