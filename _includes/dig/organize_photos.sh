#!/usr/bin/env bash

exiftool -r . -d '%y%m%d-%H%M%S' '-filename<${datetimeoriginal}.%e'