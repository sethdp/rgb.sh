---
title: Digitization
---
Starting last Christmas, I began the process of digitizing all of my family's media.
I used this opportunity to improve my bash skills.
I've written this post in the hopes that it encourages and helps others to also digitize their families' media.

All of the below scripts were written and run on a Mac.
I *highly* recommend shellharden to improve your shell scripts, which I used on all of these.

![Digitization setup](/assets/digitization/setup.jpg)
*The setup I used to digitize my family's media.*

# Tools
- [FFmpeg](https://ffmpeg.org/documentation.html)
- [ImageMagick](https://www.imagemagick.org/script/command-line-processing.php)
- [Thunderbird](https://www.thunderbird.net/en-US/) & [ImportExportTools](https://addons.mozilla.org/en-US/thunderbird/addon/importexporttools/)
- [findimagedupes](https://github.com/opennota/findimagedupes)
- [ExifTool](https://www.sno.phy.queensu.ca/~phil/exiftool/)
- [Audacity](https://www.audacityteam.org/) & [FFmpeg Plugin](https://manual.audacityteam.org/man/faq_installation_and_plug_ins.html#ffdown)
- [shellharden](https://github.com/anordal/shellharden/blob/master/how_to_do_things_safely_in_bash.md)
- [Bash 4](https://www.gnu.org/software/bash/manual/)

# Scripts
## Discs
A lot of my family's media was stored in PC backups on CD's and DVD's.
Getting the data off was not challenging but *tedious*.
I wrote the below to automatically copy all data off of the disc and eject it once finished.
```bash
{% include dig/disc.sh %}
```

I did find a few discs that macOS could not read.
I assumed these were corrupt, and tried dd, ddrescue, sleuthkit and foremost with no luck.
I even purchased a disc repair tool which still did not make the discs readable.

In the end, I was able to get most of the content off using a Windows PC.
It turns out the discs were from Windows Live OneCare and somehow did not end up burned corrected.
While I'm sure there is some way I could have gotten the same result on macOS, it was faster to just use Windows.

## Videos
![Types of media](/assets/digitization/media.jpg)
*Examples of media I captured.*

### Analog
For analog videos, I had to digitize VHS, Video8 and a single VHS-C, which later turned out to have already been copied to VHS.
All of these formats have to be played back and recorded using a capture device.
I used a USB-to-analog capture device with composite and S-Video support.

Luckily we had a VCR laying around to digitize the VHS tapes over composite.
For VHS-C we had no way to play the tape (as we never shot VHS-C; it was a relative's tape of my parents' wedding).
Thus I just bought a VHS-C-to-VHS adapter, as it would only be used once.

Video8 was another story, where my dad had shot many tapes over the years, but the original camcorder had unfortunately died.
We purchased a used Video8 camcorder off eBay, but it began failing to output video correctly after only a few tapes.
I then opted to buy a more expensive (and newer) Digital8 camcorder with Video8 support and tape playback quality improvements off eBay.
I used S-Video and RCA audio to capture the Video8 cassettes surccessfully.

### Digital
Digital videos were all gathered from my disc copies or copied from my family's computers.
Many of the videos were taken with my dad's Everio camcorder, which used the odd .MOV format that not every device will recognize.
While these were all technically playable, I wanted to put them all in a uniform format easily playable anywhere, so I opted for .mp4.
I used ffmpeg to convert every .wmv (Windows Movie Maker), .VOB (DVD) and .MOV (Everio Camcorder) to .mp4.
```bash
{% include dig/videos.sh %}
```

DVDs stored their chapters as separate .VOB files.
In some cases, I wanted these to be re-merged into a single video for playback.
The following script accomplishes this:
```bash
{% include dig/merge.sh %}
```

On Mac I used QuickTime Player (Edit > Trim ...) to manually trim the ends of the digitized and converted videos.
There is a good opportunity here for some sort of automatic trimming based on video & audio analyis.

## Audio Cassettes
There were a few Compact Cassettes of my parents' that they wanted digitized.
I recorded the cassettes from our old cassette deck into the audio inputs of the same USB-to-analog capture device.
Unfortunately, the simple nature of the capture device meant all recordings were actually videos with solid black display.
Additionally, the tapes were all recorded in mono.

ffmpeg's ffprobe tool confirmed the audio was aac, so I chose to copy out the audio stream into a .m4a audio file, which is also aac.
This avoids a lossy conversion which could degrade the audio quality (although it's unlikely that would matter when the recording was from an old cassette).
At the same time, I used the pan filter to include only the left channel of the recording and convert the audio to mono.
```bash
{% include dig/cassettes.sh %}
```
As with videos, I just used QuickTime Player to trim the audio recordings after they were processed.
On Windows, I would recommend Audicity with the ffmpeg plugin.

## Documents
I found a couple of old school assignments where I had either lost the digital original, or were never on the computer in the first place.
My parent's multifunction printer/scanner was the easiest way for me to scan the documents, but the output was a separate .jpg file per page.
ImageMagick's convert tool allowed me to easily combine multiple .jpg's into a single .pdf to reconstruct the original.
```bash
{% include dig/document.sh %}
```

Large artwork was photographed with my DSLR on a tripod with as even of lighting as possible.
I then trimmed the photos down to fit the art.

## Email
Digging into the old files I found from computer backups, I was able to get into a number of old email accounts.
Unfortunately, my old hotmail accounts had long since had their contents deleted.
Gmail, however, still held on to my old emails which I downloaded with [Google Takeout](https://takeout.google.com/settings/takeout/).
Additionally, this included the contents of my old Google Drive, which had lots of high school assignments and photos.
Afterwards, I closed down all of the accounts I regained access to.

While I didn't care about saving the emails outside of just holding onto the .mbox, I wanted the attachments of old photos and schoolwork.
The format Takeout gives emails in is .mbox, which is supposed to be at least standard*-ish*.
I had no luck extracting the email attachments by command-line with ripmime, so I used Mozilla Thunderbird with an extension. 
To extract the .mbox in a way I could work with:
1. *Local Folders (right click) > ImportExportTools > Import mbox file.*
2. *Local Folders (right click) > ImportExportTools > Export all messages in the folder > HTML format (with attachments).*

From here, I wrote a script to organize all of the attachments so that I could quickly find the attachments I care about.
```bash
{% include dig/email.sh %}
```

## Photos
### Digital
Having sorted out all of the photos copied from discs and computer backups, I had ended up with a huge number of duplicates.
findimagedupes proved fantastic for eliminating nearly all of these images.
While a few copies remained, most still had their EXIF data, allowing me to select the ones with larger file sizes by hand.
exiftool allowed me to sort the entirety of my photos safely, and find the images with duplicate EXIF data.
I wrote the following script to organize all of the photos into a consistent format, which I could then organize by event or location later.
```bash
{% include dig/photos.sh %}
```

### Analog
As of this point, I have still not digitized our analog photos.
My mom was an amature photographer before I was even born, shooting on film into the 2000's.
This leaves me with a literal mountain of film, slides and prints to digitize.
All of the film was seemingly printed, and the slides duplicates of prints.
Thus we planned to only scan in the 4"x5" prints.
I bought a special roller scanner which would be an order of magnitude faster than our cheap mutlifunction for this task.

We also had a bunch of old family photos and scrapbooks from my grandparents.
In many cases, these will have to be scanned in the bed because of size, shape or fragility.