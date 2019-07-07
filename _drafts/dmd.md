---
title: Dynamic Mode Decomposition
---
<!-- TODO 
Why can't use big lambda
Original lstsq b formulation?
-->

What is the DMD?

Link to schmid paper and wikipedia

Define modes, dynamics etc well!

https://hal-polytechnique.archives-ouvertes.fr/hal-01020654/file/DMS0022112010001217a.pdf

https://en.wikipedia.org/wiki/Dynamic_mode_decomposition

# Algorithm

$$ \mathbf{X} \rightarrow \mathbf{\Phi}, \mathbf{b}, \mathbf{\lambda} $$

$$ \mathbf{\Phi} $$ - Modes

$$ \mathbf{b} $$ - Initial Amplitudes

$$ \lambda $$ - Eigenvalues

$$ \mathbf{t} $$ - Zero-indexed timesteps $$ [0 \dots n-1] $$

$$ \mathbf{X}_1 $$ - The first through second-to-last columns of $$ \mathbf{X} $$

$$ \mathbf{X}_2 $$ - The second through last columns of $$ \mathbf{X} $$

Find the singular value decomposition of $$ \mathbf{X}_1 $$:

$$ \mathbf{X}_1 \rightarrow \mathbf{U} \mathbf{\Sigma} \mathbf{V}^* $$

Form $$ \mathbf{\tilde{A}} $$ and perform an eigendecomposition:

$$
\tilde{A} = \mathbf{U}^* \mathbf{X}_2 \mathbf{V} \mathbf{\Sigma}^{-1} \\
\tilde{A} \rightarrow \mathbf{W} \mathbf{\Lambda}
$$

Create $$ \mathbf{\Phi} $$:

$$ \mathbf{\Phi} = \mathbf{X}_2 \mathbf{V} \mathbf{\Sigma}^{-1} \mathbf{W} $$

Find the intial amplitudes of $$ \mathbf{\Phi} $$:

$$ \mathbf{b} = (\mathbf{W} \mathbf{\Lambda})^{-1} (\mathbf{\Sigma} \mathbf{V}^*)_1 $$

something with $$ \Lambda $$:

$$ \lambda = diag(\Lambda) $$

Final:

$$ \mathbf{X}_{DMD} = \mathbf{\Phi} \mathbf{b} \mathbf{\lambda}^{\mathbf{t}} $$

![DMD Input](/assets/dmd/dmd_input.png)
![DMD Reconstruction](/assets/dmd/dmd_recon.png)
*including $$ b $$ in dynamics, real\*imag not shown. compl conj pairs equal for real input*

The 4 real outer products sum to recreate the original input

$$ \mathbf{AB} = \sum \mathbf{a}_i \otimes \mathbf{b}_i $$

$$
\begin{bmatrix}
    & | & \\
    & \mathbf{a}_i & \\
    & | & \\
\end{bmatrix}
\begin{bmatrix}
    & & \\
    — & \mathbf{b}_i & — \\
    & & \\
\end{bmatrix}
= \sum
\begin{bmatrix}
    | \\
    \mathbf{a}_i \\
    | \\
\end{bmatrix}
\begin{bmatrix}
    — & \mathbf{b}_i & — \\
\end{bmatrix}
$$


# Eigenvalues & Dynamics

$$ \varphi $$ - Initial phase in radians

$$ \lambda^t = |\lambda|^t (\cos \varphi t + i \sin \varphi t) $$

$$ \varphi = \arctan \frac{ \Im(\lambda) }{ \Re(\lambda) } $$

![Dynamics Circle](/assets/dmd/dyn_circle.png)
![Dynamics Time](/assets/dmd/dyn_time.png)

# DMD versus the Fourier Transform

Using the HODMD *add link*, we can compare the DMD to the FFT on 1D data. This highlights how DMD is different that the Fourier Transform.

$$
\begin{aligned}
x_{DMD} & = & \color{red}{\mathbf{\phi} b} & \color{green}{\lambda^\mathbf{t}} \\
x_{FFT} & = & \color{red}{\frac{1}{N} A_k} & \color{green}{(e^{2 \pi i \frac{k}{N}})^\mathbf{t}}
\end{aligned}
$$

$$ A_k $$ - amplitude of kth frequency

$$ k / N $$ - relative frequency of kth element

## Periodic Input

On periodic data, the DMD is able to extract the same dynamics as the FFT.

![Periodic Input](/assets/dmd/period_input.png)
![Periodic DMD Eigenvalues](/assets/dmd/period_dmd.png)
![Periodic FFT Frequencies](/assets/dmd/period_fft.png)
![Periodic Reconstruction](/assets/dmd/period_recon.png)

Both algorithms find a pair of dynamics at a single frequency.

## Exponential Input

On an exponentially decaying system, the DMD better describes the dynamics.
Note that this is a cherry-picked example to show when DMD works better.

![Exponential Input](/assets/dmd/exp_input.png)
![Exponential DMD Eigenvalues](/assets/dmd/exp_dmd.png)
![Exponential FFT Frequencies](/assets/dmd/exp_fft.png)

See that the FFT requires many more frequencies to recontruct the system (ignoring that we could approximate it with only a few largest), while the DMD still finds a single pair of dynamics.

![Exponential Reconstruction](/assets/dmd/exp_recon.png)

Here we see how the DMD and FFT vary in the way they describe our system; the DMD better predicts the exponential decay of the wave.