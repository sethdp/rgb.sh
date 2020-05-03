---
---
/*
    Copyright (c) 2017-20 Seth Pendergrass. See LICENSE.
*/
"use strict";
window.onload = function() {

const terVS = `{% include index/terrain.vert %}`;
const terFS = `{% include index/terrain.frag %}`;
const sunVS = `{% include index/sun.vert %}`;
const sunFS = `{% include index/sun.frag %}`;

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

function MakeSun() {
    const steps = 9;
    const radius = 3;

    let sunVerts = Array(2 * (steps + 1));
    sunVerts[0] = 0;
    sunVerts[1] = -1;

    for (let i = 0; i <= steps; ++i) {
        let pt = 2 * Math.PI * i / steps + Math.PI / 2;
        sunVerts[2 * i + 2] = radius * Math.cos(pt);
        sunVerts[2 * i + 3] = radius * Math.sin(pt) - 1;
    }

    return sunVerts;
}

function MakeTerrain() {
    const width = 5;

    let terVerts = Array(3 * width * width);
    for (let i = 0; i < width * width; ++i) {
        terVerts[3 * i] = (i % width) - Math.floor(width / 2); 
        terVerts[3 * i + 1] = Math.random() * 2 * Math.PI - 1; 
        terVerts[3 * i + 2] = Math.floor(i / width) - width - 2;
    }

    let terIdxs = Array(2 * 3 * (width - 1) * (width - 1));
    for (let i = 0; i < (width - 1) * (width - 1); ++i) {
        let r = Math.floor(i / (width - 1));
        let c = i % (width - 1);
        terIdxs[6 * i] = r * width + c;
        terIdxs[6 * i + 1] = terIdxs[6 * i + 3] = r * width + c + 1;
        terIdxs[6 * i + 2] = terIdxs[6 * i + 5] = (r + 1) * width + c;
        terIdxs[6 * i + 4] = (r + 1) * width + c + 1;
    }

    return [terVerts, terIdxs];
}

function RunFrame(now) {
    time += .0001 * (now - prev);
    prev = now;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(terrainProg);
    gl.enable(gl.BLEND);
    gl.depthFunc(gl.ALWAYS);
    gl.bindBuffer(gl.ARRAY_BUFFER, terBuf);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, terIdxBuf);
    gl.vertexAttribPointer(aPosTer, 3, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(uMVPMatrix, false, proj);
    gl.uniform1f(uTimeTer, time);
    gl.drawElements(gl.TRIANGLES, terIdxs.length, gl.UNSIGNED_SHORT, 0);

    gl.useProgram(sunProg);
    gl.disable(gl.BLEND);
    gl.depthFunc(gl.LESS);
    gl.bindBuffer(gl.ARRAY_BUFFER, sunBuf);
    gl.vertexAttribPointer(aPosSun, 2, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(uMVPMatrix2, false, proj);
    gl.uniform1f(uTimeSun, time);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, sunVerts.length / 2);

    window.requestAnimationFrame(RunFrame);
}

const fbWidth = 640;
const fbHeight = 360;

const canvas = document.getElementById('gl');
canvas.width = fbWidth;
canvas.height = fbHeight;

const gl = canvas.getContext('webgl');
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
//gl.clearColor(.133, .067, 0, 1);
gl.enable(gl.DEPTH_TEST);
gl.viewport(0, 0, fbWidth, fbHeight);

const terrainProg = GenShaders(gl, terVS, terFS);
const aPosTer = gl.getAttribLocation(terrainProg, 'aPos');
const uMVPMatrix = gl.getUniformLocation(terrainProg, 'uMVPMatrix');
const uTimeTer = gl.getUniformLocation(terrainProg, 'uTime');
const sunProg = GenShaders(gl, sunVS, sunFS);
const aPosSun = gl.getAttribLocation(sunProg, 'aPos');
const uTimeSun = gl.getUniformLocation(sunProg, 'uTime');
const uMVPMatrix2 = gl.getUniformLocation(sunProg, 'uMVPMatrix');

const sunVerts = MakeSun();
const sunBuf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, sunBuf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sunVerts), gl.STATIC_DRAW);

let [terVerts, terIdxs] = MakeTerrain();
const terBuf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, terBuf);
gl.enableVertexAttribArray(aPosTer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(terVerts), gl.STATIC_DRAW);
const terIdxBuf = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, terIdxBuf);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(terIdxs), gl.STATIC_DRAW);

let proj = mat4.create();
let time = 0;
let prev = 0;

mat4.perspective(proj, 1 / Math.tan(Math.PI / 4), fbWidth / fbHeight, .01, 100);
/*
window.addEventListener('resize', function() {
    mat4.perspective(proj, 1 / Math.tan(Math.PI / 4), window.innerWidth / window.innerHeight, .01, 100);
});
*/

window.requestAnimationFrame(RunFrame);
}; //window.onload