---
---
import * as THREE from '/assets/js/three/build/three.module.js';
import { OrbitControls } from '/assets/js/three/examples/jsm/controls/OrbitControls.js';
import { GUI } from '/assets/js/three/examples/jsm/libs/dat.gui.module.js';

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
    dat.GUI
*/
let div = document.getElementById('three');

let transModel = {
    'Trans (X)': 0,
    'Rot (Y)': 0,
    'Scale': 1
};
let transView = {
    'Trans (Z)': -5,
    'Rot (Y)': 180
};
let transProj = {
    'FoV': 60
};

const gui = new GUI({ autoPlace: false });
div.append(gui.domElement);
let model = gui.addFolder('Model');
model.add(transModel, 'Trans (X)', -2, 2, .1);
model.add(transModel, 'Rot (Y)', 0, 180);
model.add(transModel, 'Scale', .5, 1.5);
let view = gui.addFolder('View');
view.add(transView, 'Trans (Z)', -5, -2, .1);
view.add(transView, 'Rot (Y)', 90, 270);
let proj = gui.addFolder('Projection');
proj.add(transProj, 'FoV', 60, 120);

/*
    three.js
*/
let renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setClearColor(0x000000, 0);
renderer.setSize(div.clientWidth, div.clientWidth * 9 / 16);
renderer.setPixelRatio(window.devicePixelRatio);
div.appendChild(renderer.domElement);

let scene = new THREE.Scene();

let camScene = new THREE.OrthographicCamera(-4, 4, 2.25, -2.25, 1, 100);
camScene.position.set(10, 10, 10);
camScene.lookAt(new THREE.Vector3(0, 0, 0));
scene.add(camScene);
let control = new OrbitControls(camScene, renderer.domElement);
control.minZoom = 1;
control.maxZoom = 4;
control.enablePan = false;

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
    vertexShader: `{% include blog/transform/transform.vert %}`,
    fragmentShader: `{% include blog/transform/transform.frag %}`
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
    tm.setX(transModel['Trans (X)']);
    rm.setFromAxisAngle(y, transModel['Rot (Y)'] * Math.PI / 180);
    s.setScalar(transModel['Scale']);
    m.compose(tm, rm, s);

    rv.setFromAxisAngle(y, transView['Rot (Y)'] * Math.PI / 180);
    tv.setZ(transView['Trans (Z)']);
    vi.compose(tv, rv, o);
    v.getInverse(vi);

    camWorld.matrix.copy(camMat);
    camWorld.position.z = transView['Trans (Z)'];
    camWorld.rotation.y = transView['Rot (Y)'] * Math.PI / 180;
    camWorld.updateMatrix();
    camWorld.updateMatrixWorld(true);
    camWorld.fov = transProj['FoV'];
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
    drawScene();
};

function animate() {
    requestAnimationFrame(animate);
    control.update();
    updateTransforms();
    drawScene();
}

animate();

function onResize() {
    renderer.setSize(div.clientWidth, div.clientWidth * 9 / 16);
    drawScene();
}
window.addEventListener('resize', onResize);