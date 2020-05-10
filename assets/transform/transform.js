---
---
'use strict';

window.onload = function() {
    /*
        Geometry
    */
    const axes = { // space independent
        mode: WebGLRenderingContext.LINES,
        verts: new Float32Array([0,0,0,4,0,0,0,0,0,0,4,0,0,0,0,0,0,4]),
        idxs: new Uint16Array([0,1,2,3,4,5]),
        colors: new Float32Array([1,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,1])
    }
    const cam = { // view space
        mode: WebGLRenderingContext.POINTS,
        verts: new Float32Array([0,0,0]),
        idxs: new Uint16Array([0]),
        colors: new Float32Array([1,1,1])
    }
    const cube = { // mesh space
        mode: WebGLRenderingContext.TRIANGLES,
        verts: new Float32Array([-1,-1,1,1,-1,1,-1,1,1,1,1,1,-1,-1,-1,1,-1,-1,-1,1,-1,1,1,-1]),
        idxs: new Uint16Array([0,1,2,1,3,2,1,5,3,5,7,3,5,4,7,4,6,7,4,0,6,0,2,6,2,3,6,3,7,6,4,5,0,5,1,0]),
        colors: new Float32Array([0,0,1,1,0,1,0,1,1,1,1,1,0,0,0,1,0,0,0,1,0,1,1,0])
    }
    const frustum = { // clipping space
        mode: WebGLRenderingContext.LINES,
        verts: new Float32Array([-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1]),
        idxs: new Uint16Array([0,1,1,3,3,2,2,0,0,4,1,5,2,6,3,7,4,5,5,7,7,6,6,4]),
        colors: new Float32Array([1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1])
    }

    function loadMesh(gl, mesh) {
        mesh.vb = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vb);
        gl.bufferData(gl.ARRAY_BUFFER, mesh.verts, gl.STATIC_DRAW);
        
        mesh.cb = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.cb);
        gl.bufferData(gl.ARRAY_BUFFER, mesh.colors, gl.STATIC_DRAW);

        mesh.ib = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.ib);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.idxs, gl.STATIC_DRAW);
    }

    /*
        Shaders
    */
    const VS = `{% include transform/transform.vert %}`
    const FS = `{% include transform/transform.frag %}`

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

    /*
        Input Parameters
    */
    const params = ['scale_m', 'rot_y_m', 'trans_x_m', 'rot_y_v', 'trans_z_v', 'fov_p']
    let values = {};

    function onInput(p, e) {
        values[p] = e.target.value;
        updateTransforms();
        drawScene();
    }

    function setupInput() {
        for (let i = 0; i < params.length; i++) {
            let p = params[i];
            let input = document.getElementById(p);
            input.addEventListener('input', e => onInput(p, e));

            // Initialize
            values[p] = input.value;
        }
    }

    /*
        Coordinate Space Changes
    */
    const spaces = ['model', 'world', 'view', 'clip', 'ndc', 'output'];
    let currentSpace = 0;

    function onChangeSpace(idx) {
        setCurrent(idx)
        drawScene();
    }

    function setCurrent(idx) {
        currentSpace = idx;
        for (const i in spaces) {
            document.getElementById(spaces[i]).hidden = i != idx;
        }
    }

    function setupChangeSpace() {
        for (let i = 0; i < spaces.length; i++) {
            document.getElementById(spaces[i] + 'Btn').addEventListener('click', () => onChangeSpace(i));
        }

        // Initialize
        setCurrent(0);
    }

    /*
        Transform Handling
    */
    let viewCamera = mat4.create();
    let projCamera = mat4.create();
    let sceneCamera = mat4.create();
    let world = mat4.create();
    let view = mat4.create();
    let proj = mat4.create();
    let viewInv = mat4.create();
    let projInv = mat4.create();
    let viewProjInv = mat4.create();

    function updateTransforms() {
        // Model
        mat4.fromScaling(world, vec3.fromValues(values['scale_m'], values['scale_m'], values['scale_m']));
        mat4.rotateY(world, world, values['rot_y_m']);
        mat4.translate(world, world, vec3.fromValues(values['trans_x_m'], 0, 0));

        // View
        mat4.targetTo(view,
            vec3.rotateY(vec3.create(),
                vec3.fromValues(0, 0, values['trans_z_v']),
                vec3.fromValues(0, 0, 0),
                values['rot_y_v'] * Math.PI / 180),
            vec3.fromValues(0, 0, 0),
            vec3.fromValues(0, 1, 0));


        // Projection
        mat4.perspective(proj, values['fov_p'] * Math.PI / 180, 1, 2, 6);

        // Inverses
        mat4.invert(viewInv, view);
        mat4.invert(projInv, proj);
        mat4.multiply(viewProjInv, viewInv, projInv);
    }

    function setupTransforms() {
        mat4.lookAt(viewCamera,
            vec3.fromValues(100, 100, 100), //pos
            vec3.fromValues(0, 0, 0), //fwd
            vec3.fromValues(-1, 1, -1)); //up
        mat4.ortho(projCamera, -4, 4, -3, 3, 1, 1000);
        mat4.multiply(sceneCamera, projCamera, viewCamera);

        updateTransforms();
    }

    /*
        Drawing
    */
    let gl;
    let prog;

    function setupGl() {
        let canvas = document.getElementById('scene');
        gl = canvas.getContext('webgl');

        canvas.width = canvas.clientWidth;
        canvas.height = canvas.width * 3 / 4;
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

        let vs = compileShader(gl, VS, gl.VERTEX_SHADER);
        let fs = compileShader(gl, FS, gl.FRAGMENT_SHADER);
        prog = linkProgram(gl, vs, fs);

        gl.useProgram(prog);
        
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        loadMesh(gl, axes);
        loadMesh(gl, cam);
        loadMesh(gl, cube);
        loadMesh(gl, frustum);
    }

    function draw(mesh, transform, clip = false, useSceneCam = true) {
        let uNDC = gl.getUniformLocation(prog, 'uNDC');
        gl.uniform1i(uNDC, clip);

        let uTrans = gl.getUniformLocation(prog, 'uTrans');
        if (!useSceneCam) {
            gl.uniformMatrix4fv(uTrans, false, transform);
        }
        else if (!clip) {
            let trans = mat4.create();
            mat4.multiply(trans, sceneCamera, transform);
            gl.uniformMatrix4fv(uTrans, false, trans);
        }
        else {
            let uMVP = gl.getUniformLocation(prog, 'uVP');
            gl.uniformMatrix4fv(uTrans, false, transform);
            gl.uniformMatrix4fv(uMVP, false, sceneCamera);
        }

        let aPos = gl.getAttribLocation(prog, 'aPos');
        let aColor = gl.getAttribLocation(prog, 'aColor');

        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vb);
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.cb);
        gl.enableVertexAttribArray(aColor);
        gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.ib);
        gl.drawElements(mesh.mode, mesh.idxs.length, gl.UNSIGNED_SHORT, 0);
    }

    function drawScene() {
        const I = mat4.create();
        let transform = mat4.create();
        let flipZ = mat4.create();

        switch (currentSpace) {
            case 0:
                draw(cube, I);
                draw(axes, I);
                break;
            case 1:
                draw(cube, world);
                draw(axes, I);
                draw(frustum, viewProjInv); 
                draw(cam, viewInv);
                break;
            case 2:
                mat4.multiply(transform, view, world);
                draw(cube, transform);
                draw(axes, I);
                draw(frustum, projInv);
                gl.disable(gl.DEPTH_TEST);
                draw(cam, I);
                gl.enable(gl.DEPTH_TEST);
                break;
            case 3:
                mat4.multiply(transform, view, world);
                mat4.multiply(transform, proj, transform);
                mat4.fromScaling(flipZ, vec3.fromValues(1, 1, -1));
                mat4.multiply(transform, flipZ, transform);
                draw(cube, transform);
                draw(axes, flipZ);
                draw(frustum, I);
                break;
            case 4:
                mat4.multiply(transform, view, world);
                mat4.multiply(transform, proj, transform);
                mat4.fromScaling(flipZ, vec3.fromValues(1, 1, -1));
                mat4.multiply(transform, flipZ, transform);
                draw(cube, transform, true);
                draw(axes, flipZ);
                draw(frustum, I);
                break;
            case 5:
                mat4.multiply(transform, view, world);
                mat4.multiply(transform, proj, transform);
                draw(cube, transform, false, false);
                break;
        }
    }

    setupInput();
    setupChangeSpace();

    setupGl();
    setupTransforms();
    drawScene();
};