---
title: 3D Matrix Transformations
styles:
    - transform.css
excerpt: An interactive journey through the matrix transformations in the rendering pipeline.
---
<script type="text/javascript" async
  src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.7/MathJax.js?config=TeX-MML-AM_CHTML">
</script>

<script type="module" src="/assets/js/transform2.js"></script>

Before getting into the details of graphics transforms, it's important to mention a few major points of confusion around the subject:

1. *You will often hear about OpenGL ("right-handed") vs DirectX ("left-handed") coordinate systems.*

    While traditionally world space may have a certain handedness (the direction of the z axis relative to x and y), this is entirely up to the choice of the programmer.
    Just note that there may be conversions&mdash;such as flipping signs or swapping axes&mdash;involved when going from a 3D modelling package to your application's coordinates.
    Below I use right-handed +Y up coordinates for all of my math up until Clip space, after which I use left-handed coordinates with +Y up.
    This is a very common pattern when working with OpenGL.

2. *Normalized Device Coordinates (NDC)*

    Each graphics API defines the axes and bounds of NDC space differently by default.
    For example, Vulkan has +Y as down and Z ranges from 0 to 1, while OpenGL has +Y as up and Z ranges from -1 to 1.
    As with the above, this is generally configurable.

3. *Row- vs Column-Major Order & Matrix Multiplication Side*

    There is a *lot* of confusion involving matrix multiplication order and row- vs column-major matrices.
    I think there are three underlying issues causing this confusion:

    - *Physical Layout*

        This determines how a linear memory sequence converts to a 2D matrix (1D index to 2D index).
        Matrices can be in either row- or column-major ordering; row-major stores row-by-row from top to bottom, while column major stores each column from left to right.
        If you switch the interpretation, it acts as a transpose.
        Be aware that row-major math is common on the CPU, while you are likely using column-major math by default in your shaders, and transpose accordingly.

    - *Logical Layout*

        How elements are arranged in the matrix (2D index to element [e.g. x translation]).
        This is decided based on which side you will be multiplying your transforms on.
        Any given matrix applied to one side of the vector will have the same result as its tranpose on the other side.
        Just be sure the elements within your matrix are arranged logically according to the side you are multiplying on after converting from linear memory with whichever matrix ordering you are using.

    - *GLSL Indices*

        Furthering the confusion, for `mat4 m;`, `m[2][3]` accesses the second column, third row *NOT* the other way around as is standard.
        [Wikipedia](https://en.wikipedia.org/wiki/Row-_and_column-major_order) explains in more detail about ordering and GLSL if you are curious.

    I will left-multiply below because I feel it better follows math convention, but the given matrices are just the transpose of the right-multiplying version.

# Interactive Transforms
This tool lets you see walk through all of the spaces of the rendering pipeline and see what effect each has.
I've limited the controls at each stage to be representative of the kinds of transforms you'd perform, but not all-inclusive.
- The red axis is x, the green axis is y and the blue axis is z.
- These axes will always be at the origin of the current space.
- The white wireframe fulcrum is the area that will be visible after projection and clipping. The white wireframe cube is this same area but after projection.
- The white dot represents the camera's location in the world.
- The cube is an object in the scene being viewed; I've given it a gradient to distinguish it's orientation (notice that the camera sees the cube from the opposite side we do).

<div id="three" style="width: 100%;"></div>

<div id="controls">
  <button value="model">Model</button>
  <button value="world">World</button>
  <button value="view">View</button>
  <button value="clip">Clip</button>
  <button value="ndc">NDC</button>
  <button value="screen">Screen</button>
</div>

<div id="spaces">
<section id="model" markdown="1">

## Model / Object Space

This is the space in which the model's vertices exist, as in a 3D modeling package.

</section>

<section id="world" markdown="1">

## World Space

Scale: <input id="scale_m" type="number" min=".5" max="1.5" step=".1" value="1">

Rotation (°Y): <input id="rot_y_m" type="number" min="0" max="180" step="10" value="0">

Translation (X): <input id="trans_x_m" type="number" min="-2" max="2" step=".1" value="0">

This represents how the model is positioned relative the every other object in the world/scene.
The matrix may be referred to as a Model matrix or a World matrix.
This transformation is applied manually in the vertex shader (or Tesselation shaders), alongside the View and Projection matrices.

$$ \mathbf{x}_{world} = \mathbf{M}_{model}\mathbf{x}_{model} $$

Generally this matrix represents a series of scales ($$ \mathbf{S} $$), rotations ($$ \mathbf{R} $$) and/or translations ($$ \mathbf{T} $$).

$$ \mathbf{M}_{model} = \mathbf{T}\mathbf{R}\mathbf{S} $$

The order of these transforms is important, as each transformation applies to the result of the previous.
A translation before a rotation will have a vastly different (and likely undesired) outcome than one after.
Also note that when doing a matrix multiply, you will want to set $$ w = 1 $$ for points and $$ w = 0 $$ for vectors in order to only translate points.
This is where you would put the location and orientation of an object within a videogame level.

$$ \mathbf{T} = \begin{bmatrix} 1 & 0 & 0 & t_x \\ 0 & 1 & 0 & t_y \\ 0 & 0 & 1 & t_z \\ 0 & 0 & 0 & 1 \end{bmatrix} $$

$$
\mathbf{R} = \mathbf{R}_z\mathbf{R}_y\mathbf{R}_x =
\begin{bmatrix} 1 & 0 & 0 & 0 \\ 0 & \cos\theta_x & -\sin\theta_x & 0 \\ 0 & \sin\theta_x & \cos\theta_x & 0 \\ 0 & 0 & 0 & 1 \end{bmatrix}
\begin{bmatrix} \cos\theta_y & 0 & \sin\theta_y & 0 \\ 0 & 1 & 0 & 0 \\ -\sin\theta_y & 0 & \cos\theta_y & 0 \\ 0 & 0 & 0 & 1 \end{bmatrix}
\begin{bmatrix} \cos\theta_z & -\sin\theta_z & 0 & 0 \\ \sin\theta_z & \cos\theta_z & 0 & 0 \\ 0 & 0 & 1 & 0 \\ 0 & 0 & 0 & 1 \end{bmatrix}
$$

$$ \mathbf{S} = \begin{bmatrix} s_x & 0 & 0 & 0 \\ 0 & s_y & 0 & 0 \\ 0 & 0 & s_z & 0 \\ 0 & 0 & 0 & 1 \end{bmatrix} $$

</section>

<section id="view" markdown="1">

## View / Camera / Eye Space

Rotation (°Y): <input id="rot_y_v" type="number" min="90" max="270" step="10" value="180">

Translation (Z): <input id="trans_z_v" type="number" min="-5" max="-2" step="1" value="-4">

This is how the model is oriented relative to our camera/eye, or where we will be projecting the 3D space into 2D space.
By applying this transform to every vertex in the scene, we effectively move and rotate everything to put the camera at the origin facing forward.
This will be important to correctly apply the projection matrix, and lets us determine what is and what is not visible to the camera.
This is applied in between the Model and Projection matrices, usually in the Vertex shader (or Tesselation shaders).

The combination of this and the model matrix is often referred to as the ModelView matrix.
There are additional considerations if transforming surface normals.
When non-uniform scaling applies from either the Model or View matrices, you must instead use a *Normal* matrix; this is the inverse transpose of the ModelView matrix.

$$ \mathbf{x}_{view} = \mathbf{M}_{view}\mathbf{M}_{model}\mathbf{x}_{model} $$

The view matrix is determined by a position and orientation.
This will often be supplied as a position ($$ p $$), forward vector ($$ f $$) and up vector ($$ u $$) from which the right vector ($$ r $$) can be calculated.

$$ \mathbf{M}_{view} = \begin{bmatrix} r_x & u_x & f_x & p_x \\ r_y & u_y & f_y & p_y \\ r_z & u_z & f_z & p_z \\ 0 & 0 & 0 & 1 \end{bmatrix} $$

</section>

<section id="clip" markdown="1">

## Clip Space

Field of View (°Vertical): <input id="fov_p" type="number" min="60" max="120" step="10" value="60">

Clip space is named becaused it is in this space that we perform *clipping* (although with a slight change of coordinates in hardware).
Vertices are clipped when any of their $$ x, y, z $$ components lie outside of the camera's frustum.
This happens in the next step by dividing each component by $$ w $$.
The Projection matrix is applied in the Vertex (or Tesselation) shader after the Model and View transforms.
A combination of the three is called the ModelViewProjection matrix.

At this point, we have projected all of the vertices in the scene towards the camera based on the projection matrix's frustum.
This essentially reshapes the frustum into a cube, adjusting all vertices accordingly.
Anything inside the cube will get drawn (ignoring depth and front-facing tests), while everything outside will not.

$$ \mathbf{x}_{clip} = \mathbf{M}_{proj}\mathbf{M}_{view}\mathbf{M}_{model}\mathbf{x}_{model} $$

The perspective projection matrix is shown here; orthographic projection is another option.
Perspective projection is a non-affine transformation.

Perspective projection is usually defined by near ($$ z_n $$) and far ($$ z_f $$) Z values for the front and back of the frustum, a vertical field of view in radians ($$ f $$) and an aspect ratio ($$ a $$).

$$ \mathbf{M}_{proj} = \begin{bmatrix} \frac{1}{a * \tan{f / 2}} & 0 & 0 & 0 \\ 0 & \frac{1}{\tan{f / 2}} & 0 & 0 \\ 0 & 0 & \frac{z_f}{z_n - z_f} & -1 \\ 0 & 0 & \frac{z_n * z_f}{z_n - z_f} & 0 \end{bmatrix} $$

</section>

<section id="ndc" markdown="1">

## Normalized Device Coordinate (NDC) Space

Normalized device coordinates have been converted from clip space by dividing all components $$ x, y, z $$ of each vertex by their $$ w $$.
Triangles entirely outside the clipping range will now be outside bounds determined by the API (that's outside -1 &ndash; 1 for $$ x $$ and $$ y$$ and 0 &ndash; 1 or -1 &ndash; 1 for $$ z $$ by default; note that yet again, this is configurable), and won't be used for rasterization.
Triangles that are partially outside the cube will be clipped at the border of the volume.
This stage occurs entirely in hardware.

$$ \mathbf{x}_{NDC} = \mathbf{x}_{proj} / x_{proj,w} $$

</section>

<section id="screen" markdown="1">

## Screen / Window Space (Output)

Here we see the results of the above transformations after rasterization.
Note that the winding order of the triangles relative the camera will determine whether they are front-facing or back-facing.
Generally, back-facing triangles will be culled at this point.
Which winding order is front-facing is user-configurable.
In general, you would also use a depth buffer here in order to keep the front-most triangle at each pixel, as opposed to overwriting with whichever was rendered most recently.

</section>
</div>