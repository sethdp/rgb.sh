#! /usr/bin/env python3
# %%
import math
import matplotlib as mpl
import matplotlib.pyplot as plt
import numpy as np
from pydmd import DMD, HODMD
from mpl_toolkits.axes_grid1 import make_axes_locatable

OUTPUT_DIR = 'assets/dmd/'

mpl.rcParams.update({
        'axes.labelsize': 'x-large',
        'figure.dpi': 300,
        'figure.figsize': (6, 4),
        'figure.titlesize': 'xx-large',
        'image.cmap': 'cool'
})

def make_dynamic(steps_cycle, radius, len=20):
    phase = 2 * math.pi / steps_cycle
    return (radius * (math.cos(phase) + 1j * math.sin(phase))) ** np.arange(len)

# %%
def plot_recon(ax, mode, dynamic, min_val, max_val, line, color, text):
    divider = make_axes_locatable(ax)

    aMode = divider.append_axes('left', '5%')
    aMode.set_ylim(-.5, 19.5)
    aMode.invert_yaxis()
    aMode.tick_params(bottom=False, left=False,
                      labelbottom=False, labelleft=False)
    aMode.imshow(mode.reshape(20, 1), vmin=min_val, vmax=max_val)
    aMode.set_ylabel('Mode ' + text)

    aDyn = divider.append_axes('bottom', '20%')
    aDyn.set_xlim(-.5, 19.5)
    aDyn.tick_params(bottom=False, left=False,
                     labelbottom=False, labelleft=False)
    aDyn.plot(dynamic, line, color=color)
    aDyn.set_xlabel('Dynamic ' + text)

    X = mode.reshape(20, 1).dot(dynamic.reshape(1, 20)).real
    ax.imshow(X, vmin=min_val, vmax=max_val)
    ax.tick_params(bottom=False, left=False,
                   labelbottom=False, labelleft=False)

dynamic1 = make_dynamic(20, .95)
dynamic2 = dynamic1.real - 1j * dynamic1.imag
mode1 = (math.cos(2 * math.pi / 20) + 1j *
         math.sin(2 * math.pi / 20)) ** np.arange(20)
mode2 = mode1.real - 1j * mode1.imag
X1 = mode1.reshape(20, 1).dot(dynamic1.reshape(1, 20)).real
X2 = mode2.reshape(20, 1).dot(dynamic2.reshape(1, 20)).real
X = X1 + X2
min_val = np.amin(X)
max_val = np.amax(X)

fig, ax = plt.subplots()
ax.imshow(X)
fig.suptitle('Input')
ax.set_xlabel('$t$')
ax.set_ylabel('$f(t)$')
plt.savefig(OUTPUT_DIR + 'dmd_input.png')

fig, ax = plt.subplots(2, 2, figsize=(6, 6))
plot_recon(ax[0, 0], mode1.real, dynamic1.real, min_val, max_val, '-', 'cyan', '1, Real')
plot_recon(ax[1, 0], -mode1.imag, dynamic1.imag, min_val, max_val, ':', 'magenta', '1, Imag')
plot_recon(ax[0, 1], mode2.real, dynamic2.real, min_val, max_val, '-', 'cyan', '2, Real')
plot_recon(ax[1, 1], -mode2.imag, dynamic2.imag, min_val, max_val, ':', 'magenta', '2, Imag')
fig.suptitle('Real Components of Reconstructions')
plt.savefig(OUTPUT_DIR + 'dmd_recon.png')

# %%
a = make_dynamic(19, 1)
b = make_dynamic(38, 1.01)
c = make_dynamic(19, .95)

fig, ax = plt.subplots()
ax.set_aspect(1)
ax.plot(a.real, a.imag, 'x:y', label=r'$(1, 2\pi/19)$')
ax.plot(b.real, b.imag, 'x:c', label=r'$(1.01, 2\pi/38)$')
ax.plot(c.real, c.imag, 'x:m', label=r'$(.95, 2\pi/19)$')
ax.add_artist(plt.Circle((0, 0), 1, color='white', fill=False))
ax.axis('equal')
ax.set_xlim(-1.6, 1.6)
ax.legend()
ax.set_xlabel('Real')
ax.set_ylabel('Imaginary')
ax.set_title('Dynamics')
plt.savefig(OUTPUT_DIR + 'dyn_circle.png')

fig, ax = plt.subplots(2, 1, True, gridspec_kw={'hspace': 0})
ax[0].plot(a.real, 'x:y')
ax[0].plot(b.real, 'x:c')
ax[0].plot(c.real, 'x:m')
ax[1].plot(a.imag, 'x:y')
ax[1].plot(b.imag, 'x:c')
ax[1].plot(c.imag, 'x:m')
ax[1].set_xlabel('t')
ax[0].set_ylabel('Real')
ax[1].set_ylabel('Imag')
ax[1].set_xticks([0, 5, 10, 15, 20])
plt.savefig(OUTPUT_DIR + 'dyn_time.png')

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
