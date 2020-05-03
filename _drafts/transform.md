---
title: 3D Matrix Transformations
scripts:
    - assets/gl-matrix-min.js
    - assets/transform/transform.js
styles:
    - assets/transform/transform.css
desc: An interactive journey through the matrix transformations in the rendering pipeline.
---
<script type="text/javascript" async
  src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.7/MathJax.js?config=TeX-MML-AM_CHTML">
</script>

<canvas id="scene"></canvas>
<div id="controls">
<button id="modelBtn">Model</button>
<button id="worldBtn">World</button>
<button id="viewBtn">View</button>
<button id="clipBtn">Clip</button>
<button id="ndcBtn">NDC</button>
<button id="outputBtn">Output</button>
</div>

Note: all matrix math is in column-major order.

<h2 id="heading"></h2>

<section id="model" markdown="1">
This is the space in which the model's vertices exist, as in as 3D modeling package.
</section>

<section id="world" markdown="1">
This represents how the model is positioned relative the every other object in the *world*.

$$ x_{world} = \mathbf{M}_{world}x = \mathbf{T}\mathbf{R}\mathbf{S}x $$

$$ \mathbf{T} = \begin{bmatrix} 1 & 0 & 0 & t_x \\ 0 & 1 & 0 & t_y \\ 0 & 0 & 1 & t_z \\ 0 & 0 & 0 & 1 \end{bmatrix} $$

$$
\mathbf{R} = \mathbf{R}_z\mathbf{R}_y\mathbf{R}_x =
\begin{bmatrix} 1 & 0 & 0 & 0 \\ 0 & \cos\theta_x & -\sin\theta_x & 0 \\ 0 & \sin\theta_x & \cos\theta_x & 0 \\ 0 & 0 & 0 & 1 \end{bmatrix}
\begin{bmatrix} \cos\theta_y & 0 & \sin\theta_y & 0 \\ 0 & 1 & 0 & 0 \\ -\sin\theta_y & 0 & \cos\theta_y & 0 \\ 0 & 0 & 0 & 1 \end{bmatrix}
\begin{bmatrix} \cos\theta_z & -\sin\theta_z & 0 & 0 \\ \sin\theta_z & \cos\theta_z & 0 & 0 \\ 0 & 0 & 1 & 0 \\ 0 & 0 & 0 & 1 \end{bmatrix}
$$

$$ \mathbf{S} = \begin{bmatrix} s_x & 0 & 0 & 0 \\ 0 & s_y & 0 & 0 \\ 0 & 0 & s_z & 0 \\ 0 & 0 & 0 & 1 \end{bmatrix} $$

Scale: <input id="scale" type="number" min=".5" max="1.5" step=".1" value="1">

Rotation (°Y): <input id="rotw" type="number" min="0" max="180" step="10" value="0">

Translation (X): <input id="transw" type="number" min="-2" max="2" step=".1" value="0">
</section>

<section id="view" markdown="1">
This is how the model is oriented relative to our *camera*, or where we will be projecting the 3D space to 2D space.

$$ x_{view} = \mathbf{M}_{view}\mathbf{M}_{world}x $$

$$ \mathbf{M}_{view} = \begin{bmatrix} right_x & up_x & forward_x & 0 \\ right_y & up_y & forward_y & 0 \\ right_z & up_z & forward_z & 0 \\ pos_x & pos_y & pos_z & 1 \end{bmatrix} $$

Rotation (°Y): <input id="rotv" type="number" min="-90" max="90" step="10" value="-20">

Translation (Z): <input id="transv" type="number" min="-5" max="-2" step="1" value="-3">
</section>

<section id="clip" markdown="1">

Clip space is named becaused it it at this point that we perform *clipping* when the z value of a vertex is less than nearZ or greater than farZ.
This is determined by the w value of each vertex, which is applied in the next step.
At this point, we have projected all of the vertices in the scene towards the camera based on the projection matrix's frustum.

$$ x_{proj} = \mathbf{M}_{proj}\mathbf{M}_{view}\mathbf{M}_{world}x $$

$$ \mathbf{M}_{proj} = \begin{bmatrix} s_x & 0 & 0 & 0 \\ 0 & s_y & 0 & 0 \\ 0 & 0 & \frac{f}{n - f} & -1 \\ 0 & 0 & \frac{n*f}{n - f} & 0 \end{bmatrix} $$

Field of View (°Vertical): <input id="fov" type="number" min="60" max="120" step="10" value="60">

Aspect Ratio: <input id="aspect" type="number" min="1" max="4" step=".1" value="1">

Near Clip: <input id="near" type="number" min="0.1" max="2" step=".1" value="2">

Far Clip: <input id="far" type="number" min="2" max="10" step=".1" value="6">
</section>

<section id="ndc" markdown="1">
Normalized device coordinates have been converted from clip space by dividing all components of each vertex by their w.
Points outside the clipping range will now be outside bounds determined by the API (0 - 1 or -1 - 1), and won't be used for rasterization.

$$ x_{NDC} = x_{proj} / x_{proj,w} $$
</section>

<section id="output" markdown="1">
Here we see the results of the above transformations.
Note that the winding order of the triangles relative the camera will determine whether they are front-facing or back-facing.
Generally, back-facing triangles will be culled at this point.
</section>