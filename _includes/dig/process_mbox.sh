#!/usr/bin/env bash
mkdir -p out
ripmime -i "$1" -d out --mailbox
mkdir -p good/decoded
mkdir -p good/text
for FILE in out/*.*; do
    RES="$(head -1 "$FILE" | grep -cv '^Content')"
    if [ "$RES" -eq 1 ]; then
        mv -nv "$FILE" "good/${FILE##out/}"
    else
        OUT="good/decoded/${FILE##out/}"
        sed "1,/(^$,^
)/d" "$FILE" | base64 -D -o "$OUT"
        if [ "$?" -eq 0 ]; then
            rm "$FILE"
        fi
    fi
done
for FILE in out/textfile*; do
    mv -nv "$FILE" "good/text/${FILE##out/}.txt"
done
