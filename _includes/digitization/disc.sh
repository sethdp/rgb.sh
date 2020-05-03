#!/usr/bin/env bash
# Assumes macOS

# Get /dev/disk* of external CD/DVD drive
dev="$(drutil status | grep -m1 -o '/dev/disk.*')"
if [ -z "$dev" ]; then
    echo "Error: no disk inserted"
    exit 1
fi

# Get /Volumes/* of external CD/DVD, assumes mounted
mount="$(mount | grep '{$dev}\w*' | grep -o '/Volumes/.*')"
in="${mount%% (*}"
out="$PWD/${in##*/}"/
mkdir -p "$out"

cp -Rv "$in" "$out"
drutil eject