---
---
import * as THREE from '/assets/js/three.module.js';

/*
    Coordinate Spaces
*/
const controls = document.querySelectorAll('#controls button');
const spaces = document.querySelectorAll('#spaces section');
let curSpace = controls[0].value;

function onChangeSpace(e) {
    curSpace = e.target.value;
    for (const s of spaces) {
        s.hidden = s.id != curSpace;
    }
    drawScene();
}

function setupSpaces() {
    for (const c of controls) {
        c.addEventListener('click', onChangeSpace);
    }
    for (const s of spaces) {
        s.hidden = s.id != curSpace;
    }
}

/*
    Parameters
*/
const params = ['scale_m', 'rot_y_m', 'trans_x_m', 'rot_y_v', 'trans_z_v', 'fov_p'];
let values = {};

function onChangeParam(e) {
    values[e.target.id] = parseFloat(e.target.value);
    updateTransforms();
    drawScene();
}

function setupParams() {
    for (const i of params) {
        let p = document.getElementById(i);
        p.addEventListener('input', onChangeParam);
        values[i] = parseFloat(p.value);
    }
    updateTransforms();
}

/*
    Three.js
*/
let renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setClearColor(0x000000, 0);
let div = document.getElementById('three');
renderer.setSize(div.clientWidth, div.clientWidth * 9 / 16);
renderer.setPixelRatio(window.devicePixelRatio);
div.appendChild(renderer.domElement);

let scene = new THREE.Scene();

let camScene = new THREE.OrthographicCamera(-8, 8, 4.5, -4.5, 1, 100);
camScene.position.set(10, 5, 5);
camScene.lookAt(new THREE.Vector3(0, 0, 0));
scene.add(camScene);

let camWorld = new THREE.PerspectiveCamera(60, 16 / 9, 1, 10);
camWorld.matrixAutoUpdate = false;
scene.add(camWorld);
let frustum = new THREE.CameraHelper(camWorld);
scene.add(frustum);

let geo = new THREE.BoxGeometry();
const faces = [0xff0000, 0x00ffff, 0x00ff00, 0xff00ff, 0x0000ff, 0xffff00];
for (var i = 0; i < geo.faces.length; ++i) {
    geo.faces[i].color.set(faces[Math.floor(i / 2)]);
}
let mat = new THREE.ShaderMaterial({
    uniforms: {
        clip: { value: false }
    },
    vertexColors: true,
    vertexShader: `{% include transform/transform.vert %}`,
    fragmentShader: `{% include transform/transform.frag %}`
});
let cube = new THREE.Mesh(geo, mat);
cube.matrixAutoUpdate = false;
scene.add(cube);

let axes = new THREE.AxesHelper(2);
axes.matrixAutoUpdate = false;
scene.add(axes);

let m = new THREE.Matrix4();
let v = new THREE.Matrix4();
let vi = new THREE.Matrix4();
let p = new THREE.Matrix4();
let mv = new THREE.Matrix4();
let vp = new THREE.Matrix4();
let mvp = new THREE.Matrix4();
let flipZ = new THREE.Matrix4();
flipZ.makeScale(1, 1, -1);

const y = new THREE.Vector3(0, 1, 0);
const o = new THREE.Vector3(1, 1, 1);

let s = new THREE.Vector3();
let rm = new THREE.Quaternion();
let tm = new THREE.Vector3();
let rv = new THREE.Quaternion();
let tv = new THREE.Vector3();

let camMat = camWorld.matrix.clone();
let axesMat = axes.matrix.clone();

function updateTransforms() {
    tm.setX(values['trans_x_m']);
    rm.setFromAxisAngle(y, values['rot_y_m'] * Math.PI / 180);
    s.setScalar(values['scale_m']);
    m.compose(tm, rm, s);

    rv.setFromAxisAngle(y, values['rot_y_v'] * Math.PI / 180);
    tv.setZ(values['trans_z_v']);
    vi.compose(tv, rv, o);
    v.getInverse(vi);

    camWorld.matrix.copy(camMat);
    camWorld.position.z = values['trans_z_v'];
    camWorld.rotation.y = values['rot_y_v'] * Math.PI / 180;
    camWorld.updateMatrix();
    camWorld.updateMatrixWorld(true);
    camWorld.fov = values['fov_p'];
    camWorld.updateProjectionMatrix();
    frustum.update();
    p.copy(camWorld.projectionMatrix);

    mv.multiplyMatrices(v, m);
    mvp.multiplyMatrices(p, mv);
    vp.multiplyMatrices(p, v);

    camMat.copy(camWorld.matrix);
}

function drawScene() {
    let cam = camScene;
    axes.visible = true;
    frustum.visible = true;
    mat.uniforms.clip.value = false;
    axes.matrix.copy(axesMat);

    switch (curSpace) {
        case 'model':
            frustum.visible = false;
            cube.matrix.identity();
            break;
        case 'world':
            cube.matrix.copy(m);
            camWorld.matrix.copy(vi);
            break;
        case 'view':
            cube.matrix.copy(mv);
            camWorld.matrix.identity();
            break;
        case 'clip':
            cube.matrix.copy(mvp);
            cube.matrix.premultiply(flipZ);
            camWorld.matrix.copy(p);
            camWorld.matrix.premultiply(flipZ);
            axes.matrix.premultiply(flipZ);
            break;
        case 'ndc':
            mat.uniforms.clip.value = true;
            cube.matrix.copy(mvp);
            cube.matrix.premultiply(flipZ);
            camWorld.matrix.copy(p);
            camWorld.matrix.premultiply(flipZ);
            axes.matrix.premultiply(flipZ);
            break;
        case 'screen':
            axes.visible = false;
            frustum.visible = false;
            cam = camWorld;
            cube.matrix.copy(m);
            camWorld.matrix.copy(camMat);
            break;
    }
    renderer.render(scene, cam);
}

window.onload = function() {
    setupSpaces();
    setupParams();
    drawScene();
};