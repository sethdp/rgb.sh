---
layout: default
scripts:
    - gl-matrix-min.js
    - index.js
styles:
    - index.css
---
# Seth Pendergrass

## About
<section>
I'm a graphics programmer living in Seattle, and this is my website.

I wasted way too much time on this design.

_Everything on this site is solely my own view---not my employer's_.
</section>

## Links
<section>
- [GitHub](//github.com/sethdp)
- [LinkedIn](//linkedin.com/in/sethdp)
</section>

## Blog
<section>
{% for post in site.posts %}
- {{ post.date | date: '%d %b %y' }} [{{ post.title }}]({{ post.url }})
{% endfor %}
</section>

## Projects
<section>
{% for project in site.data.projects %}
- {{ project.name }}  
  {% if project.arxiv %}[ArXiv](//arxiv.org/abs/{{ project.arxiv }}){% endif %} {% if project.github %}[GitHub](//github.com/sethdp/{{ project.github }}){% endif %} {% if project.youtube %}[YouTube](//youtu.be/{{ project.youtube }}){% endif %}
{% endfor %}
</section>

<canvas id="canvas"></canvas>