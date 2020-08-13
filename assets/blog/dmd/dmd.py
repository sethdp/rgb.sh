# %%
import math
import matplotlib as mpl
import matplotlib.animation as animation
import matplotlib.pyplot as plt
from mpl_toolkits.axes_grid1.axes_divider import make_axes_locatable
import numpy as np
import pydmd

mpl.rcParams.update({
    'figure.dpi': 240,
    'image.cmap': 'PiYG'
})

# %%
# DMD Reconstruction

# Create input matrix

# Build a simple matrix out of modes & eigenvalues
# The DMD should easily extract these inputs

steps = 20
angle = 2 * math.pi / steps

mode1 = complex(math.cos(angle), math.sin(angle))
mode2 = mode1.conjugate()
modes = np.vander([mode1, mode2], steps, increasing=True).T

eig_radius = .9
eig1 = eig_radius * complex(math.cos(angle), math.sin(angle))
eig2 = eig1.conjugate()
dynamics = np.vander([eig1, eig2], steps, increasing=True)

X = modes.dot(dynamics).real

f, ax = plt.subplots(figsize=(6, 5))
im = ax.imshow(X)
ax.set_xlabel('Time (steps)')
ax.set_ylabel('Values')
f.colorbar(im, shrink=.8)
f.suptitle('Input')
f.savefig('input.png')

#%%
# Reconstruct the original input

def plot_recon(ax, mode, dynamic, min_val, max_val, text):
    divider = make_axes_locatable(ax)

    aMode = divider.append_axes('left', '5%')
    aMode.set_ylim(-.5, 19.5)
    aMode.invert_yaxis()
    aMode.set_xticks([])
    aMode.set_yticks([])
    aMode.imshow(mode.reshape(20, 1), vmin=min_val, vmax=max_val)
    aMode.set_ylabel('Mode ' + text)

    aDyn = divider.append_axes('bottom', '20%')
    aDyn.set_xlim(-.5, 19.5)
    aDyn.set_xticks([])
    aDyn.set_yticks([])
    aDyn.plot(dynamic)
    aDyn.set_xlabel('Dynamic ' + text)

    Xr = mode.reshape(20, 1).dot(dynamic.reshape(1, 20)).real
    ax.imshow(Xr, vmin=min_val, vmax=max_val)
    ax.set_xticks([])
    ax.set_yticks([])

min_val = np.amin(X)
max_val = np.amax(X)

f, ax = plt.subplots(2, 2, figsize=(6, 6))
plot_recon(ax[0, 0], modes[:, 0].real, dynamics[0, :].real, min_val, max_val, '1, Real')
plot_recon(ax[1, 0], -modes[:, 0].imag, dynamics[0].imag, min_val, max_val, '1, Imag')
plot_recon(ax[0, 1], modes[:, 1].real, dynamics[1].real, min_val, max_val, '2, Real')
plot_recon(ax[1, 1], -modes[:, 1].imag, dynamics[1].imag, min_val, max_val, '2, Imag')
f.colorbar(im, ax=ax, shrink=.8)
f.suptitle('Real Components of Reconstruction')
f.savefig('recon.png')

# %%
# Compare eigenvalue angle & radius

# Create three eigenvalues of different amplitudes and angular velocities

radii = np.array([.95, 1.0, 1.01])
angles_inv = np.array([20, 20, 40])
steps = 20

angles = 2 * math.pi / angles_inv
eigs = radii * (np.cos(angles)+ 1j * np.sin(angles))
dynamics = np.vander(eigs, steps, increasing=True)

# Plot dynamics

f = plt.figure(figsize=(6, 3))
gs = f.add_gridspec(2, 2, width_ratios=(2, 3))

labels = [r'${}, 2\pi/{}$'.format(radii[i], angles_inv[i]) for i in range(len(radii))]

ax_cir = f.add_subplot(gs[:, 0])
for i in range(len(dynamics)):
    ax_cir.plot(dynamics[i].real, dynamics[i].imag, '-.', label=labels[i])
ax_cir.add_artist(plt.Circle((0, 0), 1, fill=False))
ax_cir.set_aspect('equal')
ax_cir.set_xlim(-1.25, 1.25)
ax_cir.set_ylim(-1.25, 1.25)
ax_cir.set_xlabel('Real')
ax_cir.set_ylabel('Imaginary')
ax_cir.legend(title="$|\lambda|, \\varphi$", fontsize='x-small')
ax_cir.set_title('DMD Eigenvalues v Time')

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
f.savefig('eigs.png')

# %%
# Background subtraction!

# Create a simple gradient

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

# %%
# Background subtraction figures

f, ax = plt.subplots(figsize=(8, 4.5))
f.subplots_adjust(0, 0, 1, 1, None, None)
for k, v in ax.spines.items():
    v.set_visible(False)
ax.set_xticks([])
ax.set_yticks([])
kwargs = {'fontsize': 18}
ax.text(10, 20, 'Input', **kwargs)
ax.text(10, 110, 'Foreground', **kwargs)
ax.text(170, 110, 'Background', **kwargs)

row1 = np.hstack((X[:, -1].reshape(dims), np.zeros(dims)))
row2 = np.hstack((S[:, -1].reshape(dims), L[:, -1].reshape(dims)))
full = np.vstack((row1, row2))
vmax = np.amax(full)

im = ax.imshow(full, vmin=-vmax, vmax=vmax)

f.savefig('back_sub.png')

def update(i):
    row1 = np.hstack((X[:, i].reshape(dims), np.zeros(dims)))
    row2 = np.hstack((S[:, i].reshape(dims), L[:, i].reshape(dims)))
    full = np.vstack((row1, row2))

    im.set_array(full)
    return im,

anim = animation.FuncAnimation(f, update, frames, blit=True)
anim.save('back_sub.mp4')

# %%
