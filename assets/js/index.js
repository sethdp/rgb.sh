/*
    10-11               0 - 7
    | \ |              / \ /|
0 - 3 - 5 - 7 - 9     3 - 5-6
| \ | \ | \ | \ |     | \ |/
1 - 2 - 4 - 6 - 8     2 - 4
    | \ |
    12-13
*/
const cubeIdxs = new Uint16Array([0, 1, 2, 0, 2, 3, 3, 2, 4, 3, 4, 5, 5, 4, 6, 5, 6, 7, 7, 6, 8, 7, 8, 9, 10, 3, 5, 10, 5, 11, 2, 12, 13, 2, 13, 4]);
const cubeVerts = new Float32Array([0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0]);
const cubeTex = new Float32Array([0, .25, 0, .5, .25, .5, .25, .25, .5, .5, .5, .25, .75, .5, .75, .25, 1, .5, 1, .25, .25, 0, .5, 0, .25, .75, .5, .75]);

const vsSrc = `
attribute vec3 aPos;
attribute vec2 aTex;
uniform mat4 uTrans;
varying vec2 vTex;

void main() {
    vTex = aTex;
    gl_Position = uTrans * vec4(aPos, 1);
} 
`;

const fsSrc = `
precision highp float;
uniform sampler2D uSamp;
varying vec2 vTex;

void main() {
    gl_FragColor = texture2D(uSamp, vTex);
}
`;

function matI() {
    return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}

function matRot(mat, yaw, pitch, roll) {
    let sy = Math.sin(yaw);
    let cy = Math.cos(yaw);
    let sp = Math.sin(pitch);
    let cp = Math.cos(pitch);
    let sr = Math.sin(roll);
    let cr = Math.cos(roll);

    mat[0] = cr * cy;
    mat[1] = sr * cy;
    mat[2] = -sy;
    mat[4] = cr * sy * sp - sr * cp;
    mat[5] = sr * sy * sp + cr * cp;
    mat[6] = cy * sp;
    mat[8] = cr * sy * cp + sr * sp;
    mat[9] = sr * sy * cp - cr * sp;
    mat[10] = cy * cp;
}

function matTrans(mat, x, y, z) {
    mat[12] = x;
    mat[13] = y;
    mat[14] = z;
}

/*
function matOrtho(mat, width, height, near, far) {
    mat[0] = 2 / width;
    mat[5] = 2 / height;
    mat[10] = 2 / (near - far);
    mat[14] = (far + near) / (near - far);
}
*/

function matPersp(mat, fov, aspect, near, far) {
    let f = 1 / Math.tan(fov / 2);
    mat[0] = f / aspect;
    mat[5] = f;
    mat[10] = (far + near) / (near - far);
    mat[11] = -1;
    mat[14] = 2 * far * near / (near - far);
    mat[15] = 0;
}

function matMul(mat, a, b) {
    for (let c = 0; c < 4; ++c) {
        for (let r = 0; r < 4; ++r) {
            mat[c * 4 + r] = 0;
            for (let k = 0; k < 4; ++k) {
                mat[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
            }
        }
    }
}

let canvas = document.getElementById('gl');
canvas.height = canvas.clientHeight;
canvas.width = canvas.clientWidth;

let gl = canvas.getContext('webgl');
gl.enable(gl.CULL_FACE);
gl.enable(gl.DEPTH_TEST);
gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight); 

let vs = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vs, vsSrc)
gl.compileShader(vs);

let fs = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fs, fsSrc);
gl.compileShader(fs);

let p = gl.createProgram();
gl.attachShader(p, vs);
gl.attachShader(p, fs);
gl.linkProgram(p);
gl.useProgram(p);

let vBuf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vBuf);
gl.bufferData(gl.ARRAY_BUFFER, cubeVerts, gl.STATIC_DRAW);

let aPos = gl.getAttribLocation(p, 'aPos');
gl.enableVertexAttribArray(aPos);
gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);

let tBuf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, tBuf);
gl.bufferData(gl.ARRAY_BUFFER, cubeTex, gl.STATIC_DRAW);

let iBuf = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuf);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeIdxs, gl.STATIC_DRAW);

let aTex = gl.getAttribLocation(p, 'aTex');
gl.enableVertexAttribArray(aTex);
gl.vertexAttribPointer(aTex, 2, gl.FLOAT, false, 0, 0);

gl.activeTexture(gl.TEXTURE0);

let uSamp = gl.getUniformLocation(p, 'uSamp');
gl.uniform1i(uSamp, 0);

let tex = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, tex);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);

gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
let img = new Image();
img.onload = function() {
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
}
img.src = '/assets/home/8bitme.png';

let uTrans = gl.getUniformLocation(p, 'uTrans');

let r = matI();
let t = matI();
let model = matI();
let view = matI();
let proj = matI();
let modelView = matI();
let transform = matI();

matTrans(t, -.5, -.5, -.5);
matTrans(view, 0, 0, -2);
matPersp(proj, Math.PI / 2, 16 / 9, .1, 10);

function draw(timestamp) {
    let yaw = timestamp / 1000;
    let pitch = timestamp / 2000;
    let roll = timestamp / 4000;
    matRot(r, yaw, pitch, roll);

    matMul(model, r, t);
    matMul(modelView, view, model);
    matMul(transform, proj, modelView);

    gl.uniformMatrix4fv(uTrans, false, transform);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, cubeIdxs.length, gl.UNSIGNED_SHORT, 0);

    window.requestAnimationFrame(draw);
}

draw();