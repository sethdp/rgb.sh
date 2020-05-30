---
title: Dynamic Mode Decomposition
excerpt: A brief introduction to the dynamic mode decomposition.
---

## TODO

- Flesh out eigenvalue section
- Point out constant mode v dynamic eigenvalues
- Brief comparison to FFT

In college, I got to do research on the [dynamic mode decomposition](https://en.wikipedia.org/wiki/Dynamic_mode_decomposition).
I made the GPU-accelerated implementation of the [Streaming DMD](https://arxiv.org/pdf/1612.07875); it is available on [GitHub](https://github.com/pens/libssvd).
It's an incredibly cool, but not well known, algorithm to break apart (*decompose*) a times-series matrix into exponentially growing or decaying parts oscillating at fixed frequencies (*dynamic modes*).
More simply, it let's you separate a matrix into pieces based on the underlying movement.

This is useful in analyzing changing motion, for example in fluid flows.
It also can be used to remove the background from a video, by separating the high-growth or decay foreground from the relatively constant background.
[Schmid](https://hal-polytechnique.archives-ouvertes.fr/hal-01020654/file/DMS0022112010001217a.pdf) and [Grosek & Kutz](https://arxiv.org/pdf/1404.7592.pdf) are great papers if you want to learn more.

The source code to the figures on this page is available [here](/assets/src/dmd.py). I recommend [PyDMD](https://github.com/mathLab/PyDMD) if you'd like to play around with the DMD.

## Overview

Rather than diving into the details of how you calculate the DMD, I think it's better to start by treating it as a black box.
Instead, I will show you what you can do with the DMD.

The dynamic mode decomposition turns an $$ m{\times}n $$ input matrix $$ \mathbf{X} $$ into dynamic modes $$ \mathbf{\Phi} $$ and eigenvalues $$ \mathbf{\lambda} $$, as well as the optional initial amplitudes $$ \mathbf{b} $$:

$$ \mathbf{X} \rightarrow \mathbf{\Phi}, \mathbf{\lambda} [, \mathbf{b} ]$$

Given these outputs, we can reconstruct the original input as such:

$$ \mathbf{X}_{DMD} = \mathbf{\Phi} \mathbf{B} \mathbf{\lambda}^{\mathbf{t}} $$

where $$ \mathbf{B} $$ is an $$ n{-}1{\times}n{-}1 $$ matrix with $$ \mathbf{b} $$ as its diagonal, $$ \mathbf{\lambda} $$ is the diagonal of $$ \mathbf{\Lambda} $$ and $$ \mathbf{t} = [0 \dots n{-}1] $$. $$ \mathbf{\lambda}^{\mathbf{t}} $$ a [Vandermonde matrix](https://en.wikipedia.org/wiki/Vandermonde_matrix) of $$ \lambda $$.
There are a lot of variations on how to represent this reconstruction (i.e. sum of matrix multiplications versus just matrix multiplications), but they exist for contextual convenience and will have the same result.

### Terminology

Before getting into the details of DMD, let's go over the terminology.

- System\\
    Whatever is being "observed"; represented with the input matrix
- Snapshot\\
    A measurement of the system at a fixed time; a single column of the input matrix
- Dynamics\\
    Changing part of the system
- [Mode](https://en.wikipedia.org/wiki/Normal_mode#Mode)\\
    Moving (spatial) part of the system at fixed frequency
- Dynamic Mode / DMD Mode\\
    Modes in DMD; amplitude can change in time
- DMD Eigenvalue\\
    Describes rate and direction of mode amplitude change in time
- Initial amplitudes\\
    Amplitude of the modes at time 0; the eigenvalues do not have an effect (because power of 0 is 1)

### Aside: Matrix Multiplication

In school we are taught that a matrix multiplication involves multiplying each row of the left matrix with each column of the right matrix.
While this is functionally true, I find it conceptually less useful than to think of matrix multiplication as a sum of [outer products](https://en.wikipedia.org/wiki/Outer_product#Definition):

$$ \mathbf{AB} = \sum \mathbf{a}_i \otimes \mathbf{b}_i $$

$$
\begin{bmatrix} & | & \\ & \mathbf{a}_i & \\ & | & \\ \end{bmatrix}
\begin{bmatrix} & & \\ — & \mathbf{b}_i & — \\ & & \\ \end{bmatrix}
= \sum
\begin{bmatrix} | \\ \mathbf{a}_i \\ | \\ \end{bmatrix}
\begin{bmatrix} — & \mathbf{b}_i & — \\ \end{bmatrix}
$$

This is how I think about the DMD: Each dynamic mode is multiplied by the series of eigenvalues raised to consecutive powers.
You are then summing the oscillating modes over time to reconstruct the original input; each outer product corresponds to a single frequency.
It's these lowest frequency mode(s) that correspond to the background in a video.
By removing these outer products from the final reconstruction, we are left with the foreground.

## Examples

![Input](/assets/img/dmd/input.png)

Let's try out the DMD on a synthetic example.
We will have two complex-conjugate modes.

$$ \mathbf{X}_{DMD} = \color{red}{\mathbf{\Phi} \mathbf{B}} \color{green}{\mathbf{\lambda}^{\mathbf{t}}} $$

the modes and amplitudes (shown in red) will be shown as colors while the dynamics (shown in green) will be waves.

![Example](/assets/img/dmd/recon.png)

For any given pixel in the mode / dynamic pair, the value is that of the same row of the mode times the column of the wave.

When dealing with a real-valued input, modes will form in complex-conjugate pairs.
The multiplication of a real portion of a mode with the imaginary portion of the dynamic, or vice versa, will result in an imaginary output.
The sum of these will cancel out to zero, as there is no imaginary component to the input.
Hence, I don't show these products.

These could all be pixels or waves, but I think the pixel better correlates with the physical nature of the mode while the wave shows the temporal nature of the dynamics.

### Background Subtraction

<video width="640" controls>
    <source src="/assets/video/dmd/back_sub.mp4" type="video/mp4">
    <img src="/assets/img/dmd/back_sub.png">
</video>

This is the background from the first frame, but it will stay relatively steady because of the low-energy of the corresponding mode.

Notice how the foreground is additive with the background, rather than containing the entirety of the foreground object.
If we wanted to use this in practice for video segmentation, we'd want to do some kind of filtering first.

## Eigenvalues & Dynamics

![Eigenvalues](/assets/img/dmd/eigs.png)

To calculate the Fourier "modes"?

$$ \mathbf{\omega} = \frac{ln(\mathbf{\lambda})}{\Delta t} $$

$$ \varphi $$ - Initial phase angle in radians

$$ \lambda^t = |\lambda|^t (\cos \varphi t + i \sin \varphi t) $$

$$ \varphi = \arctan \frac{ \Im(\lambda) }{ \Re(\lambda) } $$

## Algorithm

### Symbols

- $$ \mathbf{X} $$: Input matrix\\
    Each row is for a consistent sample location, while each column is a specific time.
    All columns are an equal timestep apart, where the first column is the starting value of the system.
- $$ \mathbf{X}_1 $$: The first through second-to-last columns of $$ \mathbf{X} $$
- $$ \mathbf{X}_2 $$: The second through last columns of $$ \mathbf{X} $$
- $$ \mathbf{\Phi} $$: Dynamic Modes\\
    $$ m{\times}n{-}1 $$ matrix where each column is an individual mode
- $$ \lambda $$: Eigenvalues\\
    $$ n{-}1 $$ vector of eigenvalues for each mode
- $$ \mathbf{t} $$: Timestamps\\
    The vector $$ [0 \dots n{-}1] $$
- $$ \mathbf{b} $$: Initial Amplitudes\\
    $$ n{-}1 $$ vector of starting amplitudes for each mode

I am not going to go to much into the details of calculating the DMD, but just know that there are many similar variations to get to the result with varying performance, accuracy, etc.

1. Find the singular value decomposition of $$ \mathbf{X}_1 $$, the first through second-to-last columns of the matrix we are decomposing $$ \mathbf{X} $$:

    $$ \mathbf{X}_1 \rightarrow \mathbf{U}, \mathbf{\Sigma}, \mathbf{V}^* $$

    where $$ \mathbf{U} $$ and $$ \mathbf{V} $$ are the left and right singular vectors of $$ \mathbf{X}_1 $$, and $$ \mathbf{\Sigma} $$ the singular values.
2. Form $$ \mathbf{\tilde{A}} $$ and perform an eigendecomposition:

    $$
    \tilde{\mathbf{A}} = \mathbf{U}^* \mathbf{X}_2 \mathbf{V} \mathbf{\Sigma}^{-1}\\
    \tilde{\mathbf{A}} \rightarrow \mathbf{W}, \mathbf{\Lambda}
    $$

    where $$ \mathbf{X}_2 $$ is the second through last columns of $$ \mathbf{X} $$, and $$ \mathbf{W} $$ are the eigenvectors and $$ \mathbf{\Lambda} $$ the eigenvalues of $$ \tilde{\mathbf{A}} $$. $$ \mathbf{\lambda} $$ is the diagonal of $$ \mathbf{\Lambda} $$.
3. Create the matrix of dynamic modes $$ \mathbf{\Phi} $$:

    $$ \mathbf{\Phi} = \mathbf{X}_2 \mathbf{V} \mathbf{\Sigma}^{-1} \mathbf{W} $$
4. (Optional) Find the initial amplitudes $$ \mathbf{b} $$ of $$ \mathbf{\Phi} $$:

    $$ \mathbf{b} = (\mathbf{W} \mathbf{\Lambda})^{-1} (\mathbf{\Sigma} \mathbf{V}^*)_1 $$

    $$ (\mathbf{\Sigma} \mathbf{V}^*)_1 $$ is the first column of $$ \mathbf{\Sigma} \mathbf{V}^* $$.
    This is the "fast b" calculation we used for the Streaming SVD & DMD.

At this point, we now have $$ \mathbf{X} \rightarrow \mathbf{\Phi}, \mathbf{\lambda} [, \mathbf{b} ]$$.

### Background Subtraction

To separate the background from the foreground, we continue from the above.
If working with video, you will want each column of the input matrix $$ \mathbf{X} $$ to be a flattened frame; remember to unpack these afterwards before display.

1. Convert eigenvalues to Fourier modes:

    $$ \mathbf{\omega} = \frac{ln(\mathbf{\lambda})}{\Delta t} $$

    where $$ \Delta t $$ is the time difference between snapshots.

2. Find all $$ i $$ where $$ \|\omega_i\| \approx 0 $$:

    This is probably a single index or complex conjugate pair of indices.

3. Calculate the low-rank (background) matrix $$ \mathbf{L} $$:

    $$ \mathbf{L} = \sum_{i}\mathbf{\Phi}_i \mathbf{b}_i \mathbf{\lambda}_i^\mathbf{t} $$

4. Remove the background from the input matrix to create the sparse (foreground) matrix $$ \mathbf{S} $$:

    $$ \mathbf{S} = \mathbf{X} - \mathbf{L} $$

    When working with real-valued input, you can discard the imaginary components of $$ \mathbf{S} $$ and $$ \mathbf{L} $$.