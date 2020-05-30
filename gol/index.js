"use strict";

const VS = `
    attribute vec2 aPos;
    varying lowp vec2 vPos;
    void main() {
        gl_Position = vec4(aPos * 2. - 1., 0., 1.);
        vPos = aPos;
    }
`;

const FS = `
    precision lowp float;
    uniform sampler2D uSampler;
    uniform ivec2 uDims;
    varying lowp vec2 vPos;
    void main() {
        float dx = 1. / float(uDims.x);
        float dy = 1. / float(uDims.y);
        
        int neighbors = int(
            texture2D(uSampler, vPos + vec2(dx, 0)).x +
            texture2D(uSampler, vPos + vec2(-dx, 0)).x +
            texture2D(uSampler, vPos + vec2(0, dy)).x +
            texture2D(uSampler, vPos + vec2(0, -dy)).x +
            texture2D(uSampler, vPos + vec2(dx, dy)).x +
            texture2D(uSampler, vPos + vec2(-dx, dy)).x +
            texture2D(uSampler, vPos + vec2(-dx, -dy)).x +
            texture2D(uSampler, vPos + vec2(dx, -dy)).x);

        float alive = texture2D(uSampler, vPos).x;

        if (alive == 1.) {
            if (neighbors < 2)
                gl_FragColor = vec4(0, 0, 0, 1);
            else if (neighbors < 4)
                gl_FragColor = vec4(1, 1, 1, 1);
            else
                gl_FragColor = vec4(0, 0, 0, 1);
        }
        else if (neighbors == 3) {
            gl_FragColor = vec4(1, 1, 1, 1);
        }
        else
            gl_FragColor = vec4(0, 0, 0, 1);
    }
`;

const FS2 = `
    precision lowp float;
    uniform sampler2D uSampler;
    varying lowp vec2 vPos;
    void main() {
        gl_FragColor = texture2D(uSampler, vPos);
    }
`;

window.onload = function() {
    const width = 64;
    const height = 64;

    const canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const gl = canvas.getContext('webgl');
    gl.clearColor(0, 0, 0, 1);
    gl.viewport(0, 0, canvas.width, canvas.height);

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

    const prog = MakeShaderProgram(VS, FS);
    var aPos = gl.getAttribLocation(prog, 'aPos');
    var uSampler = gl.getUniformLocation(prog, 'uSampler');
    var uDims = gl.getUniformLocation(prog, 'uDims');

    const prog2 = MakeShaderProgram(VS, FS2);
    var aPos2 = gl.getAttribLocation(prog2, 'aPos');
    var uSampler2 = gl.getUniformLocation(prog2, 'uSampler');

    const screenIdxs = [ 0, 1, 2 ];
    const screenIdxBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, screenIdxBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(screenIdxs), gl.STATIC_DRAW);

    const screenTex = [ 0, 0, 2, 0, 0, 2 ];
    const screenTexBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, screenTexBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(screenTex), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos2, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPos2);

    var tex = new Uint8Array(width * height * 4);
    for (var i = 0; i < width * height; ++i) {
        tex[4 * i] = tex[4 * i + 1] = tex[4 * i + 2] = Math.random() >= .8 ? 255 : 0;
        tex[4 * i + 3] = 255;
    }

    var tex1 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    var framebuf = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuf);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex1, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    var tex2 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex2);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    var framebuf2 = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuf2);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex2, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.useProgram(prog);
    gl.uniform1i(uSampler, 0);
    gl.uniform2i(uDims, width, height);
    gl.useProgram(prog2);
    gl.uniform1i(uSampler2, 0);

    var step = false;
    var frames = 0;
    function frame(now) {
        if (frames >= 5) {
            frames = 0;
        }
        if (frames == 0) {
            gl.useProgram(prog);
            gl.viewport(0, 0, width, height);
            gl.bindFramebuffer(gl.FRAMEBUFFER, step ? framebuf2 : framebuf);
            gl.bindTexture(gl.TEXTURE_2D, step ? tex1 : tex2);
            gl.drawElements(gl.TRIANGLES, screenIdxs.length, gl.UNSIGNED_SHORT, 0);

            gl.useProgram(prog2);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.bindTexture(gl.TEXTURE_2D, step ? tex2 : tex1);
            gl.drawElements(gl.TRIANGLES, screenIdxs.length, gl.UNSIGNED_SHORT, 0);

            step = !step;
        }
        ++frames;

        window.requestAnimationFrame(frame);
    };
    window.requestAnimationFrame(frame);
};
