precision lowp float;
attribute vec4 aPos;
uniform mat4 uMVPMatrix;
uniform float uTime;
varying vec2 vTex;

void main() {
    vTex = aPos.xz;
    gl_Position = uMVPMatrix * vec4(aPos.x, sin(aPos.y + 10. * uTime) / 10. - 1.5, aPos.z, aPos.w);
}