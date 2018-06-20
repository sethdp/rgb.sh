#!/usr/bin/env bash

# Merge individual page scans into single pdf
convert doc\ {0..$i}.jpeg doc.pdf