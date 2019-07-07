---
---
'use strict';

window.onload = function() {

const axes = { // space independent
    mode: WebGLRenderingContext.LINES,
    verts: new Float32Array([0,0,0,4,0,0,0,0,0,0,4,0,0,0,0,0,0,4]),
    inds: new Uint16Array([0,1,2,3,4,5]),
    colors: new Float32Array([1,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,1])
}
const cam = { // view space
    mode: WebGLRenderingContext.POINTS,
    verts: new Float32Array([0,0,0]),
    inds: new Uint16Array([0]),
    colors: new Float32Array([1,1,1])
}
const cube = { // model space
    mode: WebGLRenderingContext.TRIANGLES,
    verts: new Float32Array([-1,-1,1,1,-1,1,-1,1,1,1,1,1,-1,-1,-1,1,-1,-1,-1,1,-1,1,1,-1]),
    inds: new Uint16Array([0,1,2,1,3,2,1,5,3,5,7,3,5,4,7,4,6,7,4,0,6,0,2,6,2,3,6,3,7,6,4,5,0,5,1,0]),
    colors: new Float32Array([0,0,1,1,0,1,0,1,1,1,1,1,0,0,0,1,0,0,0,1,0,1,1,0])
}
const frustum = { // clipping space
    mode: WebGLRenderingContext.LINES,
    verts: new Float32Array([-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1]),
    inds: new Uint16Array([0,1,1,3,3,2,2,0,0,4,1,5,2,6,3,7,4,5,5,7,7,6,6,4]),
    colors: new Float32Array([1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1])
}

const VS = `{% include transform/transform.vert %}`
const FS = `{% include transform/transform.frag %}`

/*
TODO:
- matrix interpolation
- antialiasing
- camera point draw order
- three.js?
- webgl error checking
*/

function compileShader(gl, source, type) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    let log = gl.getShaderInfoLog(shader);
    if (log) console.log(log);

    return shader;
}

function linkProgram(gl, vertexShader, fragmentShader) {
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    let log = gl.getProgramInfoLog(program);
    if (log) console.log(log);

    return program;
}

function loadModel(gl, model) {
    model.vb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, model.vb);
    gl.bufferData(gl.ARRAY_BUFFER, model.verts, gl.STATIC_DRAW);
    
    model.cb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, model.cb);
    gl.bufferData(gl.ARRAY_BUFFER, model.colors, gl.STATIC_DRAW);

    model.ib = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.ib);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.inds, gl.STATIC_DRAW);
}

function drawModel(model, transform, clip = false, useSceneCam = true) {
    gl.uniform1i(uNDC, clip);

    if (!useSceneCam) {
        gl.uniformMatrix4fv(uTrans, false, transform);
    }
    else if (!clip) {
        let trans = mat4.create();
        mat4.multiply(trans, sceneCamera, transform);
        gl.uniformMatrix4fv(uTrans, false, trans);
    }
    else {
        gl.uniformMatrix4fv(uTrans, false, transform);
        gl.uniformMatrix4fv(uMVP, false, sceneCamera);
    }

    let aPos = gl.getAttribLocation(prog, 'aPos');
    let aColor = gl.getAttribLocation(prog, 'aColor');

    gl.bindBuffer(gl.ARRAY_BUFFER, model.vb);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, model.cb);
    gl.enableVertexAttribArray(aColor);
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.ib);
    gl.drawElements(model.mode, model.inds.length, gl.UNSIGNED_SHORT, 0);
}

var State = {
    MODEL: 0,
    WORLD: 1,
    VIEW: 2,
    CLIP: 3,
    NDC: 4,
    FINAL: 5
};
var currentState = State.MODEL;

function onChange(newState) {
    currentState = newState;
    drawScene();
}

var I = mat4.create();

function setVisible(id) {
    // set current div to hidden
    // set next to not hidden
    // hold reference to header and update through it
    // need way for id -> header string

    document.getElementById('header').innerText = id;
    var cur_id = 'model';

    var labels = ['model', 'world', 'view', 'clip', 'ndc', 'final'];
    for (var i = 0; i < labels.length; ++i) {
        document.getElementById(labels[i] + '_desc').hidden = labels[i] == id ? false : true;
    }
}

function drawScene() {
    switch (currentState) {
        case State.MODEL:
            drawModel(cube, I);
            drawModel(axes, I);
            setVisible('model');
            break;
        case State.WORLD:
            drawModel(cube, world);
            drawModel(axes, I);
            drawModel(frustum, viewProjInv); 
            drawModel(cam, viewInv);
            setVisible('world');

            title.innerText = 'World';
            break;
        case State.VIEW:
            var transform = mat4.create();
            mat4.multiply(transform, view, world);
            drawModel(cube, transform);
            drawModel(axes, I);
            drawModel(frustum, projInv);
            drawModel(cam, I);
            break;
        case State.CLIP:
            var transform = mat4.create();
            mat4.multiply(transform, view, world);
            mat4.multiply(transform, proj, transform);
            var flipZ = mat4.create();
            mat4.fromScaling(flipZ, vec3.fromValues(1, 1, -1));
            mat4.multiply(transform, flipZ, transform);
            drawModel(cube, transform);
            drawModel(axes, flipZ);
            drawModel(frustum, I);
            break;
        case State.NDC:
            var transform = mat4.create();
            mat4.multiply(transform, view, world);
            mat4.multiply(transform, proj, transform);
            var flipZ = mat4.create();
            mat4.fromScaling(flipZ, vec3.fromValues(1, 1, -1));
            mat4.multiply(transform, flipZ, transform);
            drawModel(cube, transform, true);
            drawModel(axes, flipZ);
            drawModel(frustum, I);
            break;
        case State.FINAL:
            var transform = mat4.create();
            mat4.multiply(transform, view, world);
            mat4.multiply(transform, proj, transform);
            drawModel(cube, transform, false, false);
            break;
    }
}

function setupControls() {
    var modelBtn = document.getElementById("model");
    modelBtn.addEventListener('click', () => { onChange(State.MODEL); });
    var worldBtn = document.getElementById("world");
    worldBtn.addEventListener('click', () => { onChange(State.WORLD); });
    var viewBtn = document.getElementById("view");
    viewBtn.addEventListener('click', () => { onChange(State.VIEW); });
    var clipBtn = document.getElementById("clip");
    clipBtn.addEventListener('click', () => { onChange(State.CLIP); });
    var ndcBtn = document.getElementById("ndc");
    ndcBtn.addEventListener('click', () => { onChange(State.NDC); });
    var finalBtn = document.getElementById("final");
    finalBtn.addEventListener('click', () => { onChange(State.FINAL); });

    // go through all children of child of controls
    document.getElementById('controls').children[0].children;
}

    var canvas = document.getElementById('scene');
    var gl = canvas.getContext('webgl');

    var title = document.getElementById('header');
    var desc = document.getElementById('desc');

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.width * 3 / 4;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    setupControls();

    let vs = compileShader(gl, VS, gl.VERTEX_SHADER);
    let fs = compileShader(gl, FS, gl.FRAGMENT_SHADER);
    let prog = linkProgram(gl, vs, fs);

    gl.useProgram(prog);
    
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    /* Scene */
    let uMVP = gl.getUniformLocation(prog, 'uVP');
    let uTrans = gl.getUniformLocation(prog, 'uTrans');
    let uNDC = gl.getUniformLocation(prog, 'uNDC');

    let sceneCamera = mat4.create();
    let viewCamera = mat4.create();
    let projCamera = mat4.create();
    let zero = vec3.fromValues(0, 0, 0);
    let pos = vec3.fromValues(100, 100, 100);
    let up = vec3.fromValues(-1, 1, -1);
    mat4.lookAt(viewCamera, pos, zero, up);
    mat4.ortho(projCamera, -4, 4, -3, 3, 1, 1000);
    mat4.multiply(sceneCamera, projCamera, viewCamera);    

    let world = mat4.create();
    mat4.fromTranslation(world, vec3.fromValues(0, 0, 0));

    let view = mat4.create();
    mat4.targetTo(view,
        vec3.rotateY(vec3.create(),
                     vec3.fromValues(0, 0, -3),
                     vec3.fromValues(0, 0, 0),
                     -20 * Math.PI / 180),
        vec3.fromValues(0, 0, 0),
        vec3.fromValues(0, 1, 0));
        
    let proj = mat4.create();
    mat4.perspective(proj, 60 * Math.PI / 180, 1, 2, 6);

    let viewInv = mat4.create();
    mat4.invert(viewInv, view);

    let projInv = mat4.create();
    mat4.invert(projInv, proj);

    let viewProjInv = mat4.create();
    mat4.multiply(viewProjInv, viewInv, projInv);

    loadModel(gl, axes);
    loadModel(gl, cam);
    loadModel(gl, cube);
    loadModel(gl, frustum);

    drawScene();
};