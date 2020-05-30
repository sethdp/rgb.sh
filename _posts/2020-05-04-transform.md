---
title: 3D Matrix Transformations
scripts:
    - transform.js
styles:
    - transform.css
excerpt: An interactive journey through the matrix transformations of the rendering pipeline.
---

At their most basic, [transformation matrices](https://en.wikipedia.org/wiki/Transformation_matrix) just convert coordinates from one space to another.
However, while conceptually simple, there are many small details that can make dealing with transformations confusing and frustrating.
Anytime I have *ever* done graphics work, I have ended up incorrectly applying my transformations to create varying amounts of visual garbage.
I wrote this post and built the below tool to act as a reference when working with graphics transformations.

Before getting into the details, it's important to mention a few major points of confusion around the subject:

1. *Coordinate orientation & handedness*

    The orientation of a coordinate space dictates how a coordinate $$ (x, y, z) $$ maps to an relative location in 3D space.
    There are no restrictions on how you decide to orient the axes.
    That said, it's typical to have $$ +x $$ point to the right and $$ +y $$ to point up, while forward varies.
    Generally speaking, Direct3D applications use a [left-handed system](https://en.wikipedia.org/wiki/Right-hand_rule#Coordinates) with $$ +z $$ pointing forward whereas OpenGL uses a right-handed system with $$ -z $$ forward.
    3D modeling software may use an entirely different convention, such as $$ +z $$ up & $$ +y $$ forward in Blender.

2. *Normalized device coordinates (NDC)*

    [Normalized device coordinates](https://en.wikipedia.org/wiki/Clip_coordinates), or NDC, are essentially the *real* coordinates from the perspective of the display.
    Each graphics API defines the orientation and bounds of NDC space differently by default.
    For example, Vulkan has $$ +y $$ as down and $$ z $$ ranges from 0 at the near side to 1 on the far end, while OpenGL has $$ +y $$ as up and $$ z $$ ranges from -1 to 1.
    This is not impacted by how you oriented your application's coordinate system; that instead just decides how you will convert from your coordinates to clip space, which the GPU then converts to NDC.
    This *is* somewhat configurable through your choice of graphics API, though.

3. *Row-major vs column-major storage order*

    [Matrix storage order](https://en.wikipedia.org/wiki/Row-_and_column-major_order) determines how a linear memory sequence converts to a 2D matrix (from 1D index to 2D index).
    Matrices can be in either row- or column-major ordering; row-major stores row-by-row from top to bottom, while column major stores each column from left to right.

    Given the linear sequence $$ \mathbf{x}_{memory} $$, we can see the difference:
    $$ \mathbf{x}_{memory} = \begin{bmatrix} 1 & 2 & 3 & 4 & 0 & 0 & 0 & 0 & 1 & 2 & 3 & 4 & 0 & 0 & 0 & 0 \end{bmatrix} $$

    $$ \mathbf{X}_{row-major} = \begin{bmatrix} 1 & 2 & 3 & 4 \\ 0 & 0 & 0 & 0 \\ 1 & 2 & 3 & 4 \\ 0 & 0 & 0 & 0 \end{bmatrix} $$
    $$ \mathbf{X}_{column-major} = \begin{bmatrix} 1 & 0 & 1 & 0 \\ 2 & 0 & 2 & 0 \\ 3 & 0 & 3 & 0 \\ 4 & 0 & 4 & 0 \end{bmatrix} $$

    If you switch the interpretation, it acts as a transpose.
    Be aware that row-major storage is common on the CPU, while you are likely using column-major by default in your shaders.

4. *Matrix layout & multiplication order*

    This decides how elements are arranged in the matrix (from 2D index to element [e.g. x translation]).
    This is directly tied to which side you will be multiplying your transforms on.
    OpenGL generally multiplies from the left, while Direct3D multiplies from the right.
    There is no functional difference, but it is important to know which side the matrices are intended to be multiplied on (which is generally decided by your matrix helper functions and choice of API).
    You don't have to worry about column versus row vectors; shaders will interpret a vector in the way needed for a matrix-vector multiply.

5. *GLSL matrix indices*

    [GLSL matrices](https://www.khronos.org/opengl/wiki/Data_Type_(GLSL)#Matrices) use `mat[col][row]` rather than `mat[row][col]`.
    Just be aware of this if working in GLSL.

## Interactive Transforms

This tool lets you see walk through all of the coordinate spaces of the rendering pipeline and visualize how you transform between them.
I've limited the controls at each stage to be representative, not all-inclusive, of the kinds of transforms you'd perform.

- The red axis is $$ +x $$ (right), the green axis is $$ +y $$ (up) and the blue axis is $$ +z $$ (backward until clip space, then forward).
  These axes will always be at the origin of the current space.
- Each side of the cube has a different color to help distinguish orientation.
- The camera's viewing outline has three different parts: the blue triangle indicates the up direction, the orange fulcrum bounds the camera's viewing area and the red lines extend from the camera to the viewing plane (objects here will not be rendered).
  When in clip and NDC spaces, the projection turns the frustum into a cube and the red lines diverge into a viewing direction.
- While in NDC view, the portion of the cube outside of the bounding cube will be darkened to indicate what will be clipped.

<div id="three" style="width: 100%;"></div>

<div id="controls">
  <button value="model">Model</button>
  <button value="world">World</button>
  <button value="view">View</button>
  <button value="clip">Clip</button>
  <button value="ndc">NDC</button>
  <button value="screen">Screen</button>
  <br>
  You can move the camera to get a better look.
</div>

<div id="spaces">
<section id="model" markdown="1">

### Model / Object Space

This is the space in which the model's vertices exist, as in a 3D modeling package.

At this point you would also apply animations, if applicable.

</section>

<section id="world" markdown="1">

### World Space

This represents how the model is positioned relative the every other object in the world/scene.
The matrix may be referred to as a model matrix or a world matrix.
This transformation is applied manually in the vertex shader (or tesselation shaders), alongside the view and projection matrices.

$$ \mathbf{x}_{world} = \mathbf{M} \mathbf{x}_{model} $$

Generally, this matrix represents a series of scales ($$ \mathbf{S} $$), rotations ($$ \mathbf{R} $$) and/or translations ($$ \mathbf{T} $$).

$$ \mathbf{M} = \mathbf{T}\mathbf{R}\mathbf{S} $$

The order of these transforms is important, as each transformation applies to the result of the previous.
A translation before a rotation will have a vastly different outcome than one after, as they always apply relative to the origin.
When doing a matrix multiply, you will want to set $$ w = 1 $$ for points and $$ w = 0 $$ for vectors (e.g. normals) in order to only translate points.

</section>

<section id="view" markdown="1">

### View / Camera / Eye Space

This is how the model is oriented relative to our camera/eye, or where we will be projecting the 3D space into 2D space.
This is applied in between the model and projection matrices, usually in the vertex shader (or tesselation shaders).

$$ \mathbf{x}_{view} = \mathbf{V} \mathbf{M} \mathbf{x}_{model} $$

By applying this transform to every vertex in the scene, we effectively transform everything to put the camera at the origin facing forward.
This will be important to correctly apply the projection matrix, and lets us determine what is and what is not visible to the camera.

The combination of this and the model matrix can be referred to as the ModelView matrix.
There are additional considerations if transforming surface normals.
When non-uniform scaling applies from either the model or view matrices, you must instead use a *Normal* matrix; this is the inverse transpose of the ModelView matrix.

</section>

<section id="clip" markdown="1">

### Clip Space

Clip space is named because it is in this space that we perform *clipping* (although with a slight change of coordinates in hardware into NDC).
Most commonly you will use a [perspective projection matrix](https://en.wikipedia.org/wiki/3D_projection#Perspective_projection), which maps 3D points onto a 2D plane similarly to how our eyes or a camera work.
Orthographic projections are an alternative option (you are viewing this scene through an orthographic projection until the final output).
The projection matrix is applied in the vertex (or tesselation) shader after the model and view transforms.

$$ \mathbf{x}_{clip} = \mathbf{P} \mathbf{V} \mathbf{M} \mathbf{x}_{model} $$

Perspective projection is usually defined by near and far values indicating the front and back of the frustum, a vertical field of view angle and an aspect ratio.
A combination of the three above matrices is called the ModelViewProjection matrix, and you may use it instead of its constituents as an optimization.

At this point, we have projected all of the vertices in the scene towards the camera with the projection matrix.
This reshapes the viewing frustum into a cube.
Anything inside the cube will get drawn (ignoring depth, winding-order or something more complex), while everything outside will not.

</section>

<section id="ndc" markdown="1">

### Normalized Device Coordinate (NDC) Space

Normalized device coordinates have been converted from clip space by dividing all components $$ x, y, z $$ of each vertex by their $$ w $$.
Triangles entirely outside the clipping bounds are discarded and won't be rasterized.
Triangles that are partially outside the cube will be clipped at the border of the volume.
This stage occurs entirely in hardware.

$$ \mathbf{x}_{NDC} = \mathbf{x}_{clip} / x_{clip, w} $$

</section>

<section id="screen" markdown="1">

### Screen / Window Space (Output)

Here we see the results of the above transformations after rasterization.
Note that the winding order of the triangles relative the camera will determine whether they are front-facing or back-facing, and inform whether they will be drawn; this is user-configurable.
In general, you would also use a depth buffer here in order to keep the front-most triangle at each pixel, as opposed to overwriting with whichever was rendered most recently.

</section>
</div>
