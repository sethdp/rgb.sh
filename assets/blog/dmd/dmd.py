# %%
import math
import matplotlib as mpl
import matplotlib.animation as animation
import matplotlib.pyplot as plt
from mpl_toolkits.axes_grid1 import ImageGrid
from mpl_toolkits.axes_grid1.axes_divider import make_axes_locatable
import numpy as np
import pydmd

mpl.rcParams.update({
    'figure.dpi': 240,
    'image.cmap': 'PiYG'
})

def make_unit_circle_plot(ax):
    ax.add_artist(plt.Circle((0, 0), 1, fill=False))
    ax.set_aspect('equal')
    ax.set_xticks([-1, 0, 1])
    ax.set_yticks([-1, 0, 1])
    ax.set_xlim(-1.25, 1.25)
    ax.set_ylim(-1.25, 1.25)
    ax.set_xlabel('Real')
    ax.set_ylabel('Imaginary')

def make_animation(f, axes, image_fn, frames, filename):
    images = image_fn(0)
    im = [ax.imshow(images[i], vmin=-1, vmax=1) for i, ax in enumerate(axes)]

    f.savefig(filename + '.png')

    def update(i):
        images = image_fn(i)
        for j, img in enumerate(images):
            im[j].set_array(img)
        return im

    anim = animation.FuncAnimation(f, update, frames, blit=True)
    anim.save(filename + '.mp4')

# %%
# One-Dimensional Input

# We will create a synthetic example of a 1D array changing in time
# This will create a 2D input matrix from 2 dynamic modes,
# where r is the index in the array and c is the timestep

steps = 20
angle = 2 * math.pi / steps
mode1 = complex(math.cos(angle), math.sin(angle))
mode2 = mode1.conjugate()
modes = np.vander([mode1, mode2], steps, increasing=True).T / 2

eig_radius = .9
eig1 = eig_radius * complex(math.cos(angle), math.sin(angle))
eig2 = eig1.conjugate()
eigs = np.array([eig1, eig2])
dynamics = np.vander(eigs, steps, increasing=True)

X = modes.dot(dynamics).real

# Create figures for input

# Input array changing in time, video

subplot_kw = {
    'frame_on': False,
    'xticks': [],
    'yticks': []
}
f, ax = plt.subplots(subplot_kw=subplot_kw)
def get_input_image(i):
    return [X[:, i, np.newaxis].T]
make_animation(f, [ax], get_input_image, steps, 'input')

# Input matrix, image

subplot_kw = {
    'xticks': range(0, steps, 5),
    'yticks': range(0, steps, 5),
    'xlabel': 'Frame',
    'ylabel': 'Index'
}
f, ax = plt.subplots(figsize=(6, 5), subplot_kw=subplot_kw)
im = ax.imshow(X)
f.colorbar(im, shrink=.8)
f.suptitle('Input')
f.savefig('input_matrix.png')

#%%
# One-Dimensional Reconstruction

def plot_recon(ax, mode, dynamic, vmax, text):
    divider = make_axes_locatable(ax)

    aMode = divider.append_axes('left', '5%')
    aMode.set_ylim(-.5, 19.5)
    aMode.invert_yaxis()
    aMode.set_xticks([])
    aMode.set_yticks([])
    aMode.imshow(mode.reshape(20, 1), vmax=vmax, vmin=-vmax)
    aMode.set_ylabel('Mode ' + text)

    aDyn = divider.append_axes('bottom', '20%')
    aDyn.set_xlim(-.5, 19.5)
    aDyn.set_xticks([])
    aDyn.set_yticks([])
    aDyn.plot(dynamic)
    aDyn.set_xlabel('Dynamic ' + text)

    Xr = mode.reshape(20, 1).dot(dynamic.reshape(1, 20)).real
    ax.imshow(Xr, vmax=vmax, vmin=-vmax)
    ax.set_xticks([])
    ax.set_yticks([])

f, ax = plt.subplots(2, 2, figsize=(6, 6))
plot_recon(ax[0, 0], modes[:, 0].real, dynamics[0, :].real, vmax, '1, Real')
# TODO wrong because colors modes
plot_recon(ax[1, 0], -modes[:, 0].imag, dynamics[0].imag, vmax, '1, Imag')
plot_recon(ax[0, 1], modes[:, 1].real, dynamics[1].real, vmax, '2, Real')
plot_recon(ax[1, 1], -modes[:, 1].imag, dynamics[1].imag, vmax, '2, Imag')
f.colorbar(im, ax=ax, shrink=.8)
f.suptitle('Real Components of Reconstruction')
f.savefig('recon_comp.png')

recon1 = modes[:, 0].real.reshape(20, 1).dot(dynamics[0, :].real.reshape(1, 20))
recon2 = -modes[:, 0].imag.reshape(20, 1).dot(dynamics[0].imag.reshape(1, 20))
recon3 = modes[:, 0].real.reshape(20, 1).dot(dynamics[0, :].imag.reshape(1, 20))
recon4 = modes[:, 0].imag.reshape(20, 1).dot(dynamics[0].real.reshape(1, 20))

f = plt.figure()
grid = ImageGrid(f, 111, (4, 1), share_all=True, axes_pad=0)
grid[0].set_xticks([])
grid[0].set_yticks([])
for ax in grid:
    ax.set_frame_on(False)

def get_recon_image(i):
    return [
        recon1[:, i, np.newaxis].T,
        recon2[:, i, np.newaxis].T,
        recon3[:, i, np.newaxis].T,
        recon4[:, i, np.newaxis].T
    ]

make_animation(f, [ax for ax in grid], get_recon_image, steps, 'recon')

f, ax = plt.subplots()
make_unit_circle_plot(ax)
ax.plot(eigs.real, eigs.imag, '.')

f.savefig('recon_eigs.png')

# %%
# Background Subtraction

# Create a simple gradient background

frames = 30
dims = (90, 160)
bg = np.zeros(dims)

for r in range(dims[0]):
    for c in range(dims[1]):
        bg[r, c] = r / dims[0] * c / dims[1]

X = np.ndarray((bg.size, frames))

# Create a square that moves from left to right

radius = 8
row = 40
col_start = 20
col_step = 4
for i in range(frames):
    frame = bg.copy()
    col = col_start + col_step * i
    for r in range(row - radius, row + radius):
        for c in range(col - radius, col + radius):
            frame[r, c] = 1
    
    X[:, i] = frame.flatten()

vmax = np.max(np.abs(X))

# DMD

dmd = pydmd.DMD()
dmd.fit(X)

# Low-rank / Background

# Note: generally it's better to use a threshold; there may be multiple modes
# constituting the background
abs_log_eigs = np.abs(np.log(dmd.eigs))
min_idx = np.argmin(abs_log_eigs)
mode = dmd.modes[:, min_idx, np.newaxis]
dynamic = dmd.dynamics[np.newaxis, min_idx, :]
L = mode.dot(dynamic).real

print("abs log eigs: {}".format(abs_log_eigs))
print("min: {} = {}".format(min_idx, abs_log_eigs[min_idx]))

# Sparse / Foreground

S = X - L

# Background subtraction figures

# Input matrix with foreground/background, video

f = plt.figure(figsize=(8, 4.5))
grid = ImageGrid(f, 111, (2, 2), share_all=True, axes_pad=0)
for ax in grid:
    ax.set_frame_on(False)
grid[0].set_xticks([])
grid[0].set_yticks([])
kwargs = {'fontsize': 18}
grid[0].text(10, 20, 'Input', **kwargs)
grid[2].text(10, 20, 'Foreground', **kwargs)
grid[3].text(10, 20, 'Background', **kwargs)
def get_back_sub_images(i):
    return [A[:, i].reshape(dims) for A in [X, S, L]]
make_animation(f, [grid[0], grid[2], grid[3]], get_back_sub_images, frames, 'back_sub')

# Eigenvalues on unit circle and sorted by abs log value, image

idxs = np.argsort(abs_log_eigs)
eigs_sorted = dmd.eigs[idxs]
abs_log_eigs_sorted = abs_log_eigs[idxs]

f, ax = plt.subplots(1, 2)
make_unit_circle_plot(ax[0])
ax[0].set_xlabel('Index')
ax[1].set_ylabel('$|\log \lambda|$')
ax[0].plot(eigs_sorted.real[np.newaxis], eigs_sorted.imag[np.newaxis], '.')
ax[1].plot(np.arange(abs_log_eigs.size)[np.newaxis], abs_log_eigs_sorted[np.newaxis], '.')
f.savefig('back_sub_eigs.png')

# %%
# Eigenvalues v Time

# Create three eigenvalues of different amplitudes and angular velocities

radii = np.array([.95, 1.0, 1.01])
angles_inv = np.array([20, 20, 40])
steps = 20

angles = 2 * math.pi / angles_inv
eigs = radii * (np.cos(angles) + 1j * np.sin(angles))
dynamics = np.vander(eigs, steps, increasing=True)

# Plot dynamics

f = plt.figure(figsize=(6, 3))
gs = f.add_gridspec(2, 2, width_ratios=(2, 3), hspace=0)
f.suptitle('DMD Eigenvalues v Time')

labels = [r'${}, 2\pi/{}$'.format(radii[i], angles_inv[i]) for i in range(len(radii))]

ax_cir = f.add_subplot(gs[:, 0])
make_unit_circle_plot(ax_cir)
for i in range(len(dynamics)):
    ax_cir.plot(dynamics[i].real, dynamics[i].imag, '-.', label=labels[i])
f.legend(loc='lower right', ncol=3, title="$|\lambda|, \\varphi$", fontsize='x-small')

ax_real = f.add_subplot(gs[0, 1])
ax_imag = f.add_subplot(gs[1, 1])
for i in range(len(dynamics)):
    ax_real.plot(dynamics[i].real, '-.')
    ax_imag.plot(dynamics[i].imag, '-.')
ax_real.set_xticks([])
ax_real.set_ylabel('Real')
ax_imag.set_xlabel('Time (steps)')
ax_imag.set_ylabel('Imaginary')

f.tight_layout()
f.savefig('dynamics.png')

# %%
# DMD v FFT
N = 64
wave = [.95 ** i * math.sin(2 * np.pi * i / 32) for i in range(N)]

wave_fft = np.fft.fft(wave)
wave_fft_expanded = np.zeros((2 * N,), np.complex128)
wave_fft_expanded[::2] = 2 * wave_fft
wave_fft_shifted = np.fft.fftshift(wave_fft)
recon_fft = np.fft.ifft(wave_fft_expanded).real

dmd = pydmd.HODMD(0, 0, True, True, 16)
dmd.fit(wave)
dynamics = np.vander(dmd.eigs, 2 * N, True)
recon_dmd = dmd.modes.dot((dynamics.T * dmd._b).T)[0].real

dmd_eig_phase = 2 * np.pi / 32
dmd_eig = .95 * (np.cos(dmd_eig_phase) + 1j * np.sin(dmd_eig_phase))
dmd_eigs_orig = np.asarray([dmd_eig, dmd_eig.conjugate()])


f, ax = plt.subplots(2, sharex=True, sharey=True, gridspec_kw={'hspace': 0})

ax[0].plot(wave, 'y')
ax[0].set_xlabel('$t$')
ax[0].set_ylabel('$f(t)$')
ax[0].legend(['Original Input'])

ax[1].plot(recon_fft, 'c')
ax[1].plot(recon_dmd, 'm')
ax[1].set_xlabel('$t$')
ax[1].set_ylabel('f(t)')
ax[1].legend(['FFT', 'DMD'])
f.suptitle('FFT v DMD\nReconstruction & Extrapolation')
f.savefig('fft_recon.png')

f, ax = plt.subplots(1, 2)

ax[0].plot(wave_fft_shifted.real, 'cx', wave_fft_shifted.imag, 'm+')
ax[0].set_title('FFT Frequencies')
ax[0].set_xlabel('$k$')
ax[0].set_ylabel('$A_k$')
ax[0].legend(['Real', 'Imag'])

ax[1].plot(dmd.eigs.real, dmd.eigs.imag, 'c.')
ax[1].set_title('DMD Eigenvalues')
make_unit_circle_plot(ax[1])

f.savefig('fft_comp.png')

# %%
