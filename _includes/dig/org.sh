#!/usr/bin/env sh
exiftool -r . -d '%y%m%d-%H%M%S' '-filename<${datetimeoriginal}.%e'
