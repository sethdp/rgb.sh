#!/usr/bin/env bash

# Get /dev/disk* of external CD/DVD drive
DEV="$(drutil status | grep -m1 -o '/dev/disk.*')"
if [ -z "$DEV" ]; then
    echo "Error: no disk inserted"
    exit 1
fi

# Get /Volumes/* of external CD/DVD, assumes mounted
MOUNT="$(mount | grep '{$DEV}\w*' | grep -o '/Volumes/.*')"
IN="${MOUNT%% (*}"
OUT="$(pwd)""/${IN##*/}/"
mkdir -p "$OUT"

echo "${DEV}: ${IN} -> ${OUT}"
cp -Rv "$IN" "$OUT"
drutil eject
