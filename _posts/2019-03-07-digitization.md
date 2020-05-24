---
title: Digitization
excerpt: This is the story of how I digitized all of my family's photos, home movies and files. I discuss the challenges I faced along the way as well as how I dealt with them.
---
Over the 2017 holidays, I decided to collect and digitize all of my family's home media. This included printed photos, tapes and various already-digital storage media. My goal was to make it easier to access our memories and preserve them by saving them to the cloud. I was particularly concerned by the deterioration of the discs and tapes, but making all of the content available from anywhere was also appealing.

The first stage of this process was to collect all of the media and whatever I needed to copy it onto a computer.

![Digitization setup](/assets/digitization/setup.jpg) *The setup I used to digitize my family's media. Thankfully, we had held on to all of the playback equipment needed, other than the Mini8 camcorder.*

![Types of media](/assets/digitization/media.jpg) *Some of the media I digitized. I was never able to read the SmartMedia card (bottom left), even by taking it to a professional camera store. We presume it has already been copied to disc, but I didn't think it would be worth bothering with because it came from a rather bad point-and-shoot anyway.*


All of the below scripts were written for [Bash 4](https://www.gnu.org/software/bash/manual/) and ran on a Mac. I relied on [shellharden](https://github.com/anordal/shellharden/blob/master/how_to_do_things_safely_in_bash.md) to improve these scripts. I hope these can be useful to others, but it should go without saying to use them at your own risk.



# Discs
We had created many computer backups over the years as we upgraded our PC's. This resulted in a large stack of CD's and DVD's that I would need to copy to my Mac and dig through. Getting the data off was not challenging, but *tedious*. I wrote the below to automatically copy all data off of the disc and eject it once finished, so that I could ~~watch TV~~ "be productive" while using the least effort to set up and finish the copy.
```bash
{% include digitization/disc.sh %}
```
I did find a few discs that macOS could not read. I assumed these were corrupt, and tried dd, ddrescue, sleuthkit and foremost with no luck. A disc repair tool didn't help make the discs readable either. I ended up trying a Windows PC, which was able to get most of the data off. They were apparently created with Windows Live OneCare and were never finished burning.

Each time that we moved my mom to a new laptop, we would copy the entirety of her Desktop, Photos and other user folders to her new Desktop. This would also copy over old backups, making a 3 or 4 level deep hierarchy of Desktop and backup folders on the latest backups. These backups held a lot of junk files that I didn't care about either. This, in combination with the many different backup discs, resulted in a lot of duplicated files, many of which I had no desire to keep. At this point, I used old fashioned *manual labor* to sort through the contents.



# Photos
## Digital
Having sorted out all of the photos copied from discs and computer backups, I had ended up with a huge number of duplicates. [findimagedupes](https://github.com/opennota/findimagedupes) worked great to eliminate most of the duplicates. While a few copies remained, most still had their EXIF data allowing me to select the ones with larger file sizes (and presumably resolution) by hand. [ExifTool](https://www.sno.phy.queensu.ca/~phil/exiftool/) allowed me to sort all of my photos safely, and find any images with identical EXIF data. I used the following script to organize all of the photos into a consistent format, which I could then organize by event or location later.
```bash
{% include digitization/photos.sh %}
```

## Film
As of this point, I have still not digitized our film photos. My mom shot film from way before I was born until well into the 2000's. We also have a bunch of prints from my grandparents and other relatives. This leaves me with a literal mountain of photos to digitize, on top of the original film negatives and even some slides.

At least it seems that all of my mom's film photos were printed so we can just scan them into the computer; I even bought a specialty roller scanner just for 4"x5" prints, as otherwise it would probably take an enternity on our cheap multifunction printer/scanner. For large prints from my grandparents we will have to use either the bed scanner or a camera mounted to a tripod.



# Videos
## Tape
For our home movies I had to digitize VHS, Video8 and a single VHS-C. I processed all of these by recording them being played back through a USB capture card. This was a relatively lengthy process, as the videos had to be played at normal speed, and I couldn't automate the capture. I used our VHS player and a camcorder I bought off eBay to play back our tapes. I bought a VHS-C to VHS adapter just for that single tape which, of course, turned out to already have been copied to VHS. The first Video8 camcorder I bought broke after only a couple of recordings. The second time around, I bought a high-end model made much more recently with some image correction and an S-Video output.

## Digital
I gathered our digital videos from disc backups and from my parents' current computers. These were saved in a bunch of different formats such as .MOV, .VOB and .wmv, so I opted to convert them all to .mp4 with [FFmpeg](https://ffmpeg.org/documentation.html).
```bash
{% include digitization/videos.sh %}
```
DVDs store their chapters as separate .VOB files. In some cases, I wanted these to be re-merged into a single video for playback.
```bash
{% include digitization/merge.sh %}
```
On Mac I used QuickTime Player (Edit > Trim ...) to manually trim the start and end of each video after digitized and converted to .mp4. There is a good opportunity here for some sort of automatic trimming based on video & audio analyis.



# Audio Cassettes
There were a couple of Compact Cassettes (audio tapes) my parents wanted digitized. I recorded these into the computer using the same capture card as for video, but the software didn't have a mode for audio only, and didn't support mono which all of these tapes were made in.

ffmpeg's ffprobe tool confirmed the audio was aac, so I chose to copy out the audio stream into a .m4a (aac) audio file. The pan filter let me save only the left audio channel.
```bash
{% include digitization/cassettes.sh %}
```
As with videos, I used QuickTime Player to trim the audio recordings after they were processed.



# Schoolwork
I found a couple of old school assignments where I had either lost the digital original, or were never on the computer in the first place. My parent's multifunction printer/scanner was the easiest way for me to scan the documents, but the output was a separate .jpg file per page. [ImageMagick](https://www.imagemagick.org/script/command-line-processing.php)'s convert tool allowed me to combine these into a single .pdf.
```bash
{% include digitization/document.sh %}
```
I also have a bunch of art I made back in high school. Smaller pieces were also scanned using the flatbed. Large artwork was photographed with my DSLR on a tripod with as even of lighting as possible. I then trimmed the photos down to fit the art.



# Email
I was able to track down a couple old email accounts using the data off of the backup discs. While my old hotmail had long since had its contents deleted, I was able to download all of my data from gmail using [Google Takeout](https://takeout.google.com/settings/takeout/). This also happened to include a lot of high school assignments and photos. Afterwards, I closed down all of these accounts, as well as any others I had regained access to.

While I didn't care about saving the emails outside of just holding onto the .mbox, I wanted the attachments of old photos and schoolwork. The format Takeout gives emails in is .mbox, which is supposed to be at least standard*-ish*. I had no luck extracting the email attachments by command-line with ripmime, so I used [Thunderbird](https://www.thunderbird.net/en-US/) with [ImportExportTools](https://addons.mozilla.org/en-US/thunderbird/addon/importexporttools/). To extract the .mbox in a way I could work with:
1. *Local Folders (right click) > ImportExportTools > Import mbox file.*
2. *Local Folders (right click) > ImportExportTools > Export all messages in the folder > HTML format (with attachments).*

From here, I wrote a script to organize all of the attachments so that I could quickly find the attachments I care about.
```bash
{% include digitization/email.sh %}
```

# Conclusion
After all of this, I copied all of the data to a USB hard drive as well as the cloud. I am currently going through and cleaning up the files by hand as I find time. I'd eventually like a neatly organized cloud folder of videos, pictures, etc., but at least the critical issue of the media degrading is taken care of.