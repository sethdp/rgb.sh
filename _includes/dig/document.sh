#!/usr/bin/env bash

# Merges all .jpg's in $1 into $1.pdf, based on default order
# $1: input dir

convert "$1"/*.jpg "$(basename "$1")".pdf
