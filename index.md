---
layout: default
scripts:
    - gl-matrix-min.js
    - index.js
---
# Seth Pendergrass
## About
<section>
I'm a graphics programmer living in Seattle, and this is my website.
</section>

## Links
<section>
[GitHub](//github.com/sethdp) [LinkedIn](//linkedin.com/in/sethdp/) [Twitter](//twitter.com/seth__pen) [Instagram](//instagram.com/seth.pen/)
</section>

## Blog
<section>
{% for post in site.posts -%}
- {{ post.date | date: '%d %b %y' }} [{{ post.title }}]({{ post.url }})
{% endfor %}
</section>

## Projects
<section>
- Libssvd [ArXiv](//arxiv.org/abs/1612.07875) [GitHub](//github.com/sethdp/libssvd)
- Eigenfish [GitHub](//github.com/sethdp/eigenfish)
- Tree Dance [GitHub](//github.com/sethdp/Tree-Dance) [YouTube](//youtu.be/XXFPnMiZDZg)
- Titan Fightin [YouTube](//youtu.be/4vmfLjW-_D0)
- Kinect Laser Harp [GitHub](//github.com/sethdp/Kinect-Laser-Harp) [YouTube](//youtu.be/cuG4zneXyhA)
</section>

<canvas id="canvas"></canvas>