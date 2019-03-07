---
layout: default
scripts:
    - gl-matrix-min.js
    - index.js
---
# Seth Pendergrass
## About
<section>
I'm a Computer Graphics Engineer based out of Seattle.
</section>

## Blog
<section>
{% for post in site.posts -%}
- [{{ post.title }}]({{ post.url }}) {{ post.date | date: '%B %e %Y' }}
{% endfor %}
</section>

## College Projects
<section>
- *Streaming SVD & DMD* [ArXiv](//arxiv.org/abs/1612.07875) [GitHub](//github.com/pens/libssvd)
- *Eigenfish* Fish Detector [GitHub](//github.com/pens/eigenfish)
- *Tree Dance* 3D Engine [GitHub](//github.com/pens/Tree-Dance) [YouTube](//youtu.be/XXFPnMiZDZg)
- *Titan Fightin* VR Capstone [YouTube](//youtu.be/4vmfLjW-_D0)
- *Kinect Laser Harp* Musical Instrument [GitHub](//github.com/pens/Kinect-Laser-Harp) [YouTube](//youtu.be/cuG4zneXyhA)
</section>

## Links
<section>
- [GitHub](//github.com/sethdp)
- [LinkedIn](//linkedin.com/in/sethdp/)
- [Twitter](//twitter.com/seth__pen)
- [Instagram](//instagram.com/seth.pen/)
</section>

<canvas id="canvas"></canvas>