---
---
import * as THREE from '/assets/js/three/build/three.module.js';

let renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setClearColor(0x000000, 0);
let div = document.getElementById('gl');
renderer.setSize(div.clientWidth, div.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
div.appendChild(renderer.domElement);

let scene = new THREE.Scene();

let cam = new THREE.PerspectiveCamera(60, div.clientWidth / div.clientHeight, .1, 100);
cam.position.y = 2;
cam.position.z = 8;
scene.add(cam);

let sunGeo = new THREE.CircleGeometry(4, 7, Math.PI / 2);
let sunMat = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 1.0 }
    },
    vertexShader: `{% include sun.vert %}`,
    fragmentShader: `{% include sun.frag %}`
});
let sun = new THREE.Mesh(sunGeo, sunMat);
sun.position.z = -5;
scene.add(sun);

let planeGeo = new THREE.PlaneGeometry(8, 8, 8, 8);
for (const v of planeGeo.vertices) {
    v.z = Math.PI * Math.random();
}
let planeMat = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 1.0 }
    },
    vertexShader: `{% include plane.vert %}`,
    fragmentShader: `{% include plane.frag %}`
});
let plane = new THREE.Mesh(planeGeo, planeMat);
plane.rotation.x = -Math.PI / 2
scene.add(plane);

function animate() {
    sunMat.uniforms.time.value += .001;
    planeMat.uniforms.time.value += .001;
    renderer.render(scene, cam);
    window.requestAnimationFrame(animate);
}
animate();

function onResize() {
    renderer.setSize(div.clientWidth, div.clientHeight);
}
window.addEventListener('resize', onResize);