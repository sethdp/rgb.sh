---
---
/*
    Copyright (c) 2017-18 Seth Pendergrass. See LICENSE.
*/
"use strict";
window.onload = function() {

const terVS = `{% include shaders/terrain.vert %}`;
const terFS = `{% include shaders/terrain.frag %}`;
const sunVS = `{% include shaders/sun.vert %}`;
const sunFS = `{% include shaders/sun.frag %}`;

function GenShaders(gl, vsrc, fsrc) {
    let vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vsrc);
    gl.compileShader(vs);

    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
        var info = gl.getShaderInfoLog(vs);
        throw 'Could not compile WebGL program. \n\n' + info;
    }

    let fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fsrc);
    gl.compileShader(fs);

    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        var info = gl.getShaderInfoLog(fs);
        throw 'Could not compile WebGL program. \n\n' + info;
    }

    let prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        var info = gl.getProgramInfoLog(prog);
        throw 'Could not compile WebGL program. \n\n' + info;
      }

    return prog;
}

function MakeTerrain() {
    const width = 9;

    let terVerts = Array(3 * width * width);
    for (let i = 0; i < width * width; ++i) {
        terVerts[3 * i]     = (i % width) - Math.floor(width / 2); 
        terVerts[3 * i + 1] = Math.random() * 2 * Math.PI; 
        terVerts[3 * i + 2] = Math.floor(i / width) - Math.floor(width / 2);
    }

    let terIdxs = Array(2 * 3 * (width - 1) * (width - 1));
    for (let i = 0; i < (width - 1) * (width - 1); ++i) {
        let r              = Math.floor(i / (width - 1));
        let c              = i % (width - 1);
        terIdxs[6 * i]     = c + r * width;
        terIdxs[6 * i + 1] = terIdxs[6 * i + 3] = r * width + c + 1;
        terIdxs[6 * i + 2] = terIdxs[6 * i + 5] = (r + 1) * width + c;
        terIdxs[6 * i + 4] = (r + 1) * width + c + 1;
    }

    return [terVerts, terIdxs];
}

function RunFrame(now) {
    time += .0001 * (now - prev);
    prev = now;
    mat4.fromYRotation(rot, time);
    mat4.multiply(mvp, proj, rot);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Terrain
    gl.useProgram(terrainProg);

    gl.enable(gl.BLEND);
    gl.depthFunc(gl.ALWAYS);

    gl.bindBuffer(gl.ARRAY_BUFFER, terBuf);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, terIdxBuf);
    gl.vertexAttribPointer(aPosTer, 3, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(uMVPMatrix, false, mvp);
    gl.uniform1f(uTimeTer, time);

    gl.drawElements(gl.TRIANGLES, terIdxs.length, gl.UNSIGNED_SHORT, 0);

    // Sun
    gl.useProgram(sunProg);

    gl.disable(gl.BLEND);
    gl.depthFunc(gl.LESS);

    gl.bindBuffer(gl.ARRAY_BUFFER, sunBuf);
    gl.vertexAttribPointer(aPosSun, 2, gl.FLOAT, false, 0, 0);
    gl.uniform4i(uDimsSun, fbWidth, fbHeight, canvas.clientWidth, canvas.clientHeight);
    gl.uniform1f(uTimeSun, time);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

const fbWidth  = 640;
const fbHeight = 480;

// Create context
const canvas  = document.getElementById('canvas');
canvas.width  = fbWidth;
canvas.height = fbHeight;

const gl = canvas.getContext('webgl');
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
gl.clearColor(.1, .05, 0, 1);
gl.enable(gl.DEPTH_TEST);
gl.viewport(0, 0, fbWidth, fbHeight);

// Set up shaders
const terrainProg = GenShaders(gl, terVS, terFS);
const aPosTer     = gl.getAttribLocation(terrainProg, 'aPos');
const uMVPMatrix  = gl.getUniformLocation(terrainProg, 'uMVPMatrix');
const uTimeTer    = gl.getUniformLocation(terrainProg, 'uTime');

const sunProg     = GenShaders(gl, sunVS, sunFS);
const aPosSun     = gl.getAttribLocation(sunProg, 'aPos');
const uDimsSun    = gl.getUniformLocation(sunProg, 'uDims');
const uTimeSun    = gl.getUniformLocation(sunProg, 'uTime');

// Screen-space triangle for sun
const sunVerts = [ 0, 0, 2, 0, 0, 2 ];
const sunBuf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, sunBuf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sunVerts), gl.STATIC_DRAW);

// Create terrain
let [terVerts, terIdxs] = MakeTerrain();

const terBuf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, terBuf);
gl.enableVertexAttribArray(aPosTer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(terVerts), gl.STATIC_DRAW);

const terIdxBuf = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, terIdxBuf);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(terIdxs), gl.STATIC_DRAW);

let proj = mat4.create();
let rot  = mat4.create();
let mvp  = mat4.create();
let time = 0;
let prev = 0;

mat4.perspective(proj, 1 / Math.tan(Math.PI / 4), window.innerWidth / window.innerHeight, .01, 100);
window.addEventListener('resize', function() {
    mat4.perspective(proj, 1 / Math.tan(Math.PI / 4), window.innerWidth / window.innerHeight, .01, 100);
});

function frame(now) {
    RunFrame(now);
    window.requestAnimationFrame(frame);
};
window.requestAnimationFrame(frame);

}; //window.onload