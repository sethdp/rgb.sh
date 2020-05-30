#! /usr/bin/env python3
# %%
import math
import matplotlib as mpl
import matplotlib.pyplot as plt
import numpy as np
from pydmd import DMD, HODMD
from mpl_toolkits.axes_grid1 import make_axes_locatable

# %%
N = 64
wave = np.sin(np.arange(N) * 2 * math.pi * 2 / N)

wave_fft = np.fft.fft(wave)
wave_fft_shifted = np.fft.fftshift(wave_fft)
freq = np.fft.fftfreq(N)
imin = np.argmin(wave_fft.imag)
imax = np.argmax(wave_fft.imag)

dmd = HODMD(0, 0, True, True, 16)
dmd.fit(wave)

dmd_eig_phase = 2 * np.pi * 2 / 64
dmd_eig = np.cos(dmd_eig_phase) + 1j * np.sin(dmd_eig_phase)
dmd_eigs_orig = np.asarray([dmd_eig, dmd_eig.conjugate()])

fig, ax = plt.subplots()
ax.plot(wave, 'y')
ax.set_title('Periodic Input')
ax.set_xlabel('$t$')
ax.set_ylabel('$f(t)$')
ax.set_yticks([-1, -.5, 0, .5, 1])
plt.savefig(OUTPUT_DIR + 'period_input.png')

fig, ax = plt.subplots()
ax.plot(dmd.eigs.real, dmd.eigs.imag, 'co')
ax.plot(dmd_eigs_orig.real, dmd_eigs_orig.imag, 'mo', mfc='none')
ax.set_title('DMD Eigenvalues')
ax.set_xlabel('Real')
ax.set_ylabel('Imag')
ax.axis('equal')
ax.set_xlim(-1.6, 1.6)
ax.set_yticks([-1, 0, 1])
ax.legend(['Found', 'Actual'])
ax.add_artist(plt.Circle((0, 0), 1, color='white', fill=False, linewidth=1))
plt.savefig(OUTPUT_DIR + 'period_dmd.png')

fig, ax = plt.subplots()
ax.plot(wave_fft_shifted.real, 'cx', wave_fft_shifted.imag, 'm+')
ax.set_title('FFT Frequencies')
ax.set_xlabel('$k$')
ax.set_ylabel('$A_k$')
ax.legend(['Real', 'Imag'])
plt.savefig(OUTPUT_DIR + 'period_fft.png')

fig, ax = plt.subplots()
ax.plot(wave_fft[imin] * np.exp(2 * math.pi * 1j * freq[imin] * np.arange(N)) / N +
        wave_fft[imax] * np.exp(2 * math.pi * 1j * freq[imax] * np.arange(N)) / N, 'c-')
ax.plot((dmd.modes[0, 0] * dmd._b[0] * (dmd.eigs[0] ** np.arange(N))).real +
        (dmd.modes[0, 1] * dmd._b[1] * (dmd.eigs[1] ** np.arange(N))).real, 'm--')
ax.set_title('Reconstruction')
ax.set_xlabel('$t$')
ax.set_ylabel('$f(t)$')
ax.set_yticks([-1, -.5, 0, .5, 1])
ax.legend(['FFT', 'DMD'])
plt.savefig(OUTPUT_DIR + 'period_recon.png')

# %%
N = 64
wave = [.95 ** i * math.sin(2 * np.pi * i / 32) for i in range(N)]

wave_fft = np.fft.fft(wave)
wave_fft_expanded = np.zeros((2 * N,), np.complex128)
wave_fft_expanded[::2] = 2 * wave_fft
wave_fft_shifted = np.fft.fftshift(wave_fft)
recon_fft = np.fft.ifft(wave_fft_expanded).real

dmd = HODMD(0, 0, True, True, 16)
dmd.fit(wave)
dynamics = np.vander(dmd.eigs, 2 * N, True)
recon_dmd = dmd.modes.dot((dynamics.T * dmd._b).T)[0].real

dmd_eig_phase = 2 * np.pi / 32
dmd_eig = .95 * (np.cos(dmd_eig_phase) + 1j * np.sin(dmd_eig_phase))
dmd_eigs_orig = np.asarray([dmd_eig, dmd_eig.conjugate()])

fig, ax = plt.subplots()
ax.plot(wave, 'y')
ax.set_title('Exponential Input')
ax.set_xlabel('$t$')
ax.set_ylabel('$f(t)$')
plt.savefig(OUTPUT_DIR + 'exp_input.png')

fig, ax = plt.subplots()
ax.plot(dmd.eigs.real, dmd.eigs.imag, 'co')
ax.plot(dmd_eigs_orig.real, dmd_eigs_orig.imag, 'mo', mfc='none')
ax.set_title('DMD Eigenvalues')
ax.set_xlabel('Real')
ax.set_ylabel('Imag')
ax.axis('equal')
ax.set_xlim(-1.6, 1.6)
ax.set_yticks([-1, -.5, 0, .5, 1])
ax.legend(['Found', 'Actual'])
ax.add_artist(plt.Circle((0, 0), 1, color='white', fill=False, linewidth=1))
plt.savefig(OUTPUT_DIR + 'exp_dmd.png')

fig, ax = plt.subplots()
ax.plot(wave_fft_shifted.real, 'cx', wave_fft_shifted.imag, 'm+')
ax.set_title('FFT Frequencies')
ax.set_xlabel('$k$')
ax.set_ylabel('$A_k$')
ax.legend(['Real', 'Imag'])
plt.savefig(OUTPUT_DIR + 'exp_fft.png')

fig, ax = plt.subplots()
ax.plot(recon_fft[:64], 'c-')
ax.plot(np.arange(64, 128), recon_fft[64:], 'c:')
ax.plot(recon_dmd[:64], 'm--')
ax.plot(np.arange(64, 128), recon_dmd[64:], 'm-.')
ax.set_title('Extrapolated Reconstruction')
ax.set_xlabel('$t$')
ax.set_ylabel('f(t)')
ax.legend(['FFT', 'FFT Ext.', 'DMD', 'DMD Ext.'])
plt.savefig(OUTPUT_DIR + 'exp_recon.png')

#%%

'''

<!--
## DMD versus the Fourier Transform

Using the HODMD *add link*, we can compare the DMD to the FFT on 1D data. This highlights how DMD is different that the Fourier Transform.

$$
\begin{aligned}
x_{DMD} & = & \color{red}{\mathbf{\phi} b} & \color{green}{\lambda^\mathbf{t}} \\
x_{FFT} & = & \color{red}{\frac{1}{N} A_k} & \color{green}{(e^{2 \pi i \frac{k}{N}})^\mathbf{t}}
\end{aligned}
$$

$$ A_k $$ - amplitude of kth frequency

$$ k / N $$ - relative frequency of kth element

### Periodic Input

On periodic data, the DMD is able to extract the same dynamics as the FFT.

![Periodic Input](/assets/dmd/period_input.png)
![Periodic DMD Eigenvalues](/assets/dmd/period_dmd.png)
![Periodic FFT Frequencies](/assets/dmd/period_fft.png)
![Periodic Reconstruction](/assets/dmd/period_recon.png)

Both algorithms find a pair of dynamics at a single frequency.

### Exponential Input

On an exponentially decaying system, the DMD better describes the dynamics.
Note that this is a cherry-picked example to show when DMD works better.

![Exponential Input](/assets/dmd/exp_input.png)
![Exponential DMD Eigenvalues](/assets/dmd/exp_dmd.png)
![Exponential FFT Frequencies](/assets/dmd/exp_fft.png)

See that the FFT requires many more frequencies to recontruct the system (ignoring that we could approximate it with only a few largest), while the DMD still finds a single pair of dynamics.

![Exponential Reconstruction](/assets/dmd/exp_recon.png)

Here we see how the DMD and FFT vary in the way they describe our system; the DMD better predicts the exponential decay of the wave.
-->
'''