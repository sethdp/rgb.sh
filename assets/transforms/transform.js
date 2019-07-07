---
---
'use strict';

const cube = {
  mode: WebGLRenderingContext.TRIANGLES,
  verts: new Float32Array([-1,-1,1,1,-1,1,-1,1,1,1,1,1,-1,-1,-1,1,-1,-1,-1,1,-1,1,1,-1]),
  inds: new Uint16Array([0,1,2,1,3,2,1,5,3,5,7,3,5,4,7,4,6,7,4,0,6,0,2,6,2,3,6,3,7,6,4,5,0,5,1,0]),
  colors: new Float32Array([0,0,1,1,0,1,0,1,1,1,1,1,0,0,0,1,0,0,0,1,0,1,1,0])
}
const axes = {
  mode: WebGLRenderingContext.LINES,
  verts: new Float32Array([0,0,0,4,0,0,0,0,0,0,4,0,0,0,0,0,0,4]),
  inds: new Uint16Array([0,1,2,3,4,5]),
  colors: new Float32Array([1,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,1])
}
const cam = {
  mode: WebGLRenderingContext.POINTS,
  verts: new Float32Array([0,0,0]),
  inds: new Uint16Array([0]),
  colors: new Float32Array([1,1,1])
}
const frustum = {
  mode: WebGLRenderingContext.LINES,
  verts: new Float32Array([-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1]),
  inds: new Uint16Array([0,1,1,3,3,2,2,0,0,4,1,5,2,6,3,7,4,5,5,7,7,6,6,4]),
  colors: new Float32Array([1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1])
}

const VS = `{% include transform/transform.vert %}`
const FS = `{% include transform/transform.frag %}`

class Stage {
  static compileShader(gl, source, type) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    //TODO error checking
    let log = gl.getShaderInfoLog(shader);
    if (log) console.log(log);

    return shader;
  }

  static linkProgram(gl, vertexShader, fragmentShader) {
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    //TODO error checking
    let log = gl.getProgramInfoLog(program);
    if (log) console.log(log);

    return program;
  }

  static bindAnimation(stage) {
    stage.canvas.addEventListener('touchstart', ev => { ev.preventDefault(); stage.onStart(ev.touches[0]); });
    stage.canvas.addEventListener('touchend', ev => { ev.preventDefault(); stage.onStop(); });
    stage.canvas.addEventListener('touchmove', ev => { ev.preventDefault(); stage.onMove(ev.touches[0]); });
    stage.canvas.addEventListener('mousedown', stage.onStart.bind(stage) );
    stage.canvas.addEventListener('mouseup', stage.onStop.bind(stage) );
    stage.canvas.addEventListener('mouseleave', stage.onStop.bind(stage) );
    stage.canvas.addEventListener('mousemove', stage.onMove.bind(stage));
  };

  static drawScene(stage) {
    stage.models.forEach(obj => {
      let aPos = stage.gl.getAttribLocation(stage.prog, 'aPos');
      let aColor = stage.gl.getAttribLocation(stage.prog, 'aColor');
      let uMVP = stage.gl.getUniformLocation(stage.prog, 'uVP');
      let uTrans = stage.gl.getUniformLocation(stage.prog, 'uTrans');
      let uNDC = stage.gl.getUniformLocation(stage.prog, 'uNDC');
      let viewCam = mat4.create();
      let projCam = mat4.create();
      let zero = vec3.fromValues(0, 0, 0);
      let pos = vec3.fromValues(100, 100, 100);
      let up = vec3.fromValues(-1, 1, -1);
      vec3.rotateY(pos, pos, vec3.fromValues(0, 0, 0), stage.rotY);
      vec3.rotateY(up, up, vec3.fromValues(0, 0, 0), stage.rotY);
      mat4.lookAt(viewCam, pos, zero, up);
      mat4.ortho(projCam, -4, 4, -3, 3, 1, 1000);
      mat4.multiply(viewCam, projCam, viewCam);

      if (obj.vp == null) {
        mat4.multiply(viewCam, viewCam, obj.transform);
        if (obj.applyCamera)
          stage.gl.uniformMatrix4fv(uTrans, false, viewCam);
        else
          stage.gl.uniformMatrix4fv(uTrans, false, obj.transform);
        stage.gl.uniform1i(uNDC, false);
      } else {
        stage.gl.uniformMatrix4fv(uTrans, false, obj.transform);
        stage.gl.uniformMatrix4fv(uMVP, false, viewCam);
        stage.gl.uniform1i(uNDC, true);
      }

      stage.gl.bindBuffer(stage.gl.ARRAY_BUFFER, obj.vBuf);
      stage.gl.enableVertexAttribArray(aPos);
      stage.gl.vertexAttribPointer(aPos, 3, stage.gl.FLOAT, false, 0, 0);

      stage.gl.bindBuffer(stage.gl.ARRAY_BUFFER, obj.cBuf);
      stage.gl.enableVertexAttribArray(aColor);
      stage.gl.vertexAttribPointer(aColor, 3, stage.gl.FLOAT, false, 0, 0);

      stage.gl.bindBuffer(stage.gl.ELEMENT_ARRAY_BUFFER, obj.iBuf);
      stage.gl.drawElements(obj.mode, obj.count, stage.gl.UNSIGNED_SHORT, 0);
    });
  }
  constructor(id) {
    this.id = id;
    this.canvas = document.getElementById(id);
    this.gl = this.canvas.getContext('webgl');

    this.resize();

    let vs = Stage.compileShader(this.gl, VS, this.gl.VERTEX_SHADER);
    let fs = Stage.compileShader(this.gl, FS, this.gl.FRAGMENT_SHADER);
    this.prog = Stage.linkProgram(this.gl, vs, fs);

    this.gl.useProgram(this.prog);

    this.models = new Map();

    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);

    Stage.bindAnimation(this, this.onStart, this.onStop);

    this.time = null;
    this.rotY = 0;
    this.prevX = 0;
  }

  resize() {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientWidth * 3 / 4;
    this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
  }

  loadObj(data, transform, vp = null, applyCamera = true) {
    let obj = {};

    obj.vBuf = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, obj.vBuf);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, data.verts, this.gl.STATIC_DRAW);

    obj.cBuf = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, obj.cBuf);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, data.colors, this.gl.STATIC_DRAW);

    obj.iBuf = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, obj.iBuf);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, data.inds, this.gl.STATIC_DRAW);

    obj.count = data.inds.length;
    obj.mode = data.mode;

    obj.transform = transform;
    obj.vp = vp;
    obj.applyCamera = applyCamera;

    this.models.set(data, obj);
  }

  animate(timestamp) {
    if (!this.time) this.time = timestamp;
    if (timestamp - this.time > 1000 / 30) {
      //this.rotY += .001 * (timestamp - this.time);
      this.time = timestamp;
      Stage.drawScene(this);
      if (!this.animated) {
        this.time = null;
        return;
      }
    }
    window.requestAnimationFrame(this.animate.bind(this));
  }

  onMove(ev) {
    if (this.animated) {
      this.rotY += .01 * (ev.clientX - this.prevX);
      this.prevX = ev.clientX;
    }
  }

  onStart(ev) {
    this.animated = true;
    this.prevX = ev.clientX;
    window.requestAnimationFrame(this.animate.bind(this));
  }

  onStop() {
    this.animated = false;
  }
}

var stages;

window.onload = function() {
  let models = [cube, axes, frustum, cam];
  let stageIds = ['model', 'world', 'view', 'clip', 'viewport', 'output'];
  stages = stageIds.map(id => new Stage(id));

  stages[0].loadObj(cube, vpCam);
  stages[0].loadObj(axes, vpCam);

  stages[1].loadObj(cube, model);
  stages[1].loadObj(axes, vpCam);
  stages[1].loadObj(frustum, viewProjInv);
  stages[1].loadObj(cam, viewInv);

  stages[2].loadObj(cube, view);
  stages[2].loadObj(axes, vpCam);
  stages[2].loadObj(frustum, projInv);
  stages[2].loadObj(cam, vpCam);

  stages[3].loadObj(cube, projFlipZ);
  stages[3].loadObj(axes, flipZ);
  stages[3].loadObj(frustum, vpCam);

  stages[4].loadObj(cube, projFlipZ, vpCam);
  stages[4].loadObj(axes, flipZ);
  stages[4].loadObj(frustum, vpCam);
  
  stages[5].loadObj(cube, proj, null, false);

  change();
  stages.forEach(s => Stage.drawScene(s));

  document.querySelectorAll('input').forEach(
    x => x.addEventListener('input',
      () => {
        change();
        stages.forEach(s => Stage.drawScene(s));
    }));
  window.addEventListener('resize',
    () => stages.forEach(
        s => {
            s.resize();
            Stage.drawScene(s);
    }));
};

let vpCam = mat4.create();
let view = mat4.create();
let proj = mat4.create();
let model = mat4.create();
let viewInv = mat4.create();
let projInv = mat4.create();
let flipZ = mat4.create();
let viewProjInv = mat4.create();
let projFlipZ = mat4.create();

function change() {
  let readValue = x => parseFloat(document.getElementById(x).value);

  let s = readValue('scale');
  let rw = readValue('rotw');
  let tw = readValue('transw');
  let rv = readValue('rotv');
  let tv = readValue('transv');
  let fov = readValue('fov');
  let ar = readValue('aspect');
  let near = readValue('near');
  let far = readValue('far');

  mat4.fromTranslation(model, vec3.fromValues(0, 0, tw));
  mat4.rotateY(model, model, rw * Math.PI / 180);
  mat4.scale(model, model, vec3.fromValues(s, s, s));
  mat4.targetTo(view,
                vec3.rotateY(vec3.create(),
                             vec3.fromValues(0, 0, tv),
                             vec3.fromValues(0, 0, 0),
                             rv * Math.PI / 180),
                vec3.fromValues(0, 0, 0),
                vec3.fromValues(0, 1, 0));
  mat4.perspective(proj, fov * Math.PI / 180, ar, near, far * 1);
  mat4.invert(viewInv, view);
  mat4.invert(projInv, proj);
  mat4.fromScaling(flipZ, vec3.fromValues(1, 1, -1));
  mat4.multiply(view, view, model);
  mat4.multiply(proj, proj, view);
  mat4.multiply(viewProjInv, viewInv, projInv);
  mat4.multiply(projFlipZ, flipZ, proj);
}
