---
title: 3D Matrix Transformations
scripts:
    - gl-matrix-min.js
    - assets/transforms/transform.js
styles:
    - assets/transforms/transform.css
---

Note: all matrix math is in column-major order.

## Model/Object Space
This is the space in which the model's vertices exist, as in as 3D modeling package.

<div class="aspect">
<canvas id="model"></canvas>
</div>

## World Space
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

<canvas id="world"></canvas>

## View/Camera/Eye Space
This is how the model is oriented relative to our *camera*, or where we will be projecting the 3D space to 2D space.

$$ x_{view} = \mathbf{M}_{view}\mathbf{M}_{world}x $$

$$ \mathbf{M}_{view} = \begin{bmatrix} right_x & up_x & forward_x & 0 \\ right_y & up_y & forward_y & 0 \\ right_z & up_z & forward_z & 0 \\ pos_x & pos_y & pos_z & 1 \end{bmatrix} $$

Rotation (°Y): <input id="rotv" type="number" min="-90" max="90" step="10" value="-20">

Translation (Z): <input id="transv" type="number" min="-5" max="-2" step="1" value="-3">

<canvas id="view"></canvas>

## Clip Space
Clip space is named becaused it it at this point that we perform *clipping* when the z value of a vertex is less than nearZ or greater than farZ.
This is determined by the w value of each vertex, which is applied in the next step.
At this point, we have projected all of the vertices in the scene towards the camera based on the projection matrix's frustum.

$$ x_{proj} = \mathbf{M}_{proj}\mathbf{M}_{view}\mathbf{M}_{world}x $$

$$ \mathbf{M}_{proj} = \begin{bmatrix} s_x & 0 & 0 & 0 \\ 0 & s_y & 0 & 0 \\ 0 & 0 & \frac{f}{n - f} & -1 \\ 0 & 0 & \frac{n*f}{n - f} & 0 \end{bmatrix} $$

Field of View (°Vertical): <input id="fov" type="number" min="60" max="120" step="10" value="60">

Aspect Ratio: <input id="aspect" type="number" min="1" max="4" step=".1" value="1">

Near Clip: <input id="near" type="number" min="0.1" max="2" step=".1" value="2">

Far Clip: <input id="far" type="number" min="2" max="10" step=".1" value="6">

<canvas id="clip"></canvas>

## Normalized Device Coordinates (NDC)
Normalized device coordinates have been converted from clip space by dividing all components of each vertex by their w.
Points outside the clipping range will now be outside bounds determined by the API (0 - 1 or -1 - 1), and won't be used for rasterization.

$$ x_{NDC} = x_{proj} / x_{proj,w} $$

<canvas id="viewport"></canvas>

## Final
Here we see the results of the above transformations.
Note that the winding order of the triangles relative the camera will determine whether they are front-facing or back-facing.
Generally, back-facing triangles will be culled at this point.

<canvas id="output"></canvas>