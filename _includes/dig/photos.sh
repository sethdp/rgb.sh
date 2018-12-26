#!/usr/bin/env bash

exiftool -r "$1" -d %y%m%d%H%M%S%%-c.%%e '-filename<filemodifydate' '-filename<createdate' '-filename<datetimeoriginal'