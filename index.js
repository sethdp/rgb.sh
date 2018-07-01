---
---
/*
    Copyright (c) 2017-18 Seth Pendergrass. See LICENSE.
*/

"use strict";

const terVS = `{% include shaders/terrain.vert %}`;
const terFS = `{% include shaders/terrain.frag %}`;
const sunVS = `{% include shaders/sun.vert %}`;
const sunFS = `{% include shaders/sun.frag %}`;
const crtVS = `{% include shaders/crt.vert %}`;
const crtFS = `{% include shaders/crt.frag %}`;

window.onload = function() {
    const fbWidth = 360;
    const fbHeight = 240;

    const canvas = document.getElementById('canvas');
    canvas.width = fbWidth * 3;
    canvas.height = fbHeight * 3;

    const gl = canvas.getContext('webgl');
    gl.clearColor(.1, .05, 0, 1);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.viewport(0, 0, fbWidth, fbHeight);

    function MakeShaderProgram(vssrc, fssrc) {
        var vs = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vs, vssrc);
        gl.compileShader(vs);

        var fs = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fs, fssrc);
        gl.compileShader(fs);

        var prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);

        return prog;
    };

    var proj = mat4.create();
    mat4.perspective(proj, 1 / Math.tan(Math.PI / 4), window.innerWidth / window.innerHeight, .01, 100);

    window.addEventListener('resize', function() {
        mat4.perspective(proj, 1 / Math.tan(Math.PI / 4), window.innerWidth / window.innerHeight, .01, 100);
    });

    const terrainProg = MakeShaderProgram(terVS, terFS);
    var aPosTer = gl.getAttribLocation(terrainProg, 'aPos');
    var uMVPMatrix = gl.getUniformLocation(terrainProg, 'uMVPMatrix');
    var uTimeTer = gl.getUniformLocation(terrainProg, 'uTime');

    const sunProg = MakeShaderProgram(sunVS, sunFS);
    var aPosSun = gl.getAttribLocation(sunProg, 'aPos');
    var uDimsSun = gl.getUniformLocation(sunProg, 'uDims');

    const crtProg = MakeShaderProgram(crtVS, crtFS);
    var aPosCrt = gl.getAttribLocation(crtProg, 'aPos');
    var uSampler = gl.getUniformLocation(crtProg, 'uSampler');
    var uTimeCrt = gl.getUniformLocation(crtProg, 'uTime');

    const terBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, terBuf);
    gl.enableVertexAttribArray(aPosTer);

    const terIdxBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, terIdxBuf);

    const screenIdxs = [ 0, 1, 2 ];
    const screenIdxBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, screenIdxBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(screenIdxs), gl.STATIC_DRAW);

    const screenTex = [ 0, 0, 2, 0, 0, 2 ];
    const screenTexBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, screenTexBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(screenTex), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPosCrt, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosCrt);

    const target = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, target);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, fbWidth, fbHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const framebuf = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuf);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target, 0);

    const width = 9;
    var terVerts = Array(3 * width * width);
    for (var i = 0; i < width * width; ++i) {
        terVerts[3 * i]     = (i % width) - Math.floor(width / 2); 
        terVerts[3 * i + 1] = Math.random() * 2 * Math.PI; 
        terVerts[3 * i + 2] = Math.floor(i / width) - Math.floor(width / 2);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, terBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(terVerts), gl.STATIC_DRAW);

    var terIdxs = Array(2 * 3 * (width - 1) * (width - 1));
    for (var i = 0; i < (width - 1) * (width - 1); ++i) {
        var r = Math.floor(i / (width - 1));
        var c = i % (width - 1);
        terIdxs[6 * i] = c + r * width;
        terIdxs[6 * i + 1] = terIdxs[6 * i + 3] = r * width + c + 1;
        terIdxs[6 * i + 2] = terIdxs[6 * i + 5] = (r + 1) * width + c;
        terIdxs[6 * i + 4] = (r + 1) * width + c + 1;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, terIdxBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(terIdxs), gl.STATIC_DRAW);

    var matA = mat4.create();
    var matB = mat4.create();
    var time = 0;
    var prev = 0;
    var prev2 = 0;

    function frame(now) {
        time += .0001 * (now - prev);
        prev = now;

        mat4.fromYRotation(matA, time);
        mat4.multiply(matB, proj, matA);

        gl.useProgram(sunProg);
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuf);
        gl.viewport(0, 0, fbWidth, fbHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.bindBuffer(gl.ARRAY_BUFFER, screenTexBuf);
        gl.vertexAttribPointer(aPosSun, 2, gl.FLOAT, false, 0, 0);
        gl.uniform4i(uDimsSun, fbWidth, fbHeight, canvas.clientWidth, canvas.clientHeight);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, screenIdxBuf);

        gl.drawElements(gl.TRIANGLES, screenIdxs.length, gl.UNSIGNED_SHORT, 0);

        gl.useProgram(terrainProg);
        gl.bindBuffer(gl.ARRAY_BUFFER, terBuf);
        gl.vertexAttribPointer(aPosTer, 3, gl.FLOAT, false, 0, 0);
        gl.uniformMatrix4fv(uMVPMatrix, false, matB);
        gl.uniform1f(uTimeTer, time);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, terIdxBuf);

        gl.drawElements(gl.TRIANGLES, terIdxs.length, gl.UNSIGNED_SHORT, 0);

        gl.useProgram(crtProg);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.bindBuffer(gl.ARRAY_BUFFER, screenTexBuf);
        gl.vertexAttribPointer(aPosCrt, 2, gl.FLOAT, false, 0, 0);
        gl.bindTexture(gl.TEXTURE_2D, target);
        gl.uniform1i(uSampler, 0);
        gl.uniform1f(uTimeCrt, time);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, screenIdxBuf);

        gl.drawElements(gl.TRIANGLES, screenIdxs.length, gl.UNSIGNED_SHORT, 0);

        window.requestAnimationFrame(frame);
    };
    window.requestAnimationFrame(frame);
};