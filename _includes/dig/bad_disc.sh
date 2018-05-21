# First method
ddrescue -r1 -b2048 /dev/disk2 bad.iso bad.log

# Second method
dd if=/dev/disk2 of=bad.iso bs=2048 conv=noerror,notrunc
sudo foremost -i bad.iso -o recovered
