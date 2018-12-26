precision lowp float;
attribute vec4 aPos;
uniform mat4 uMVPMatrix;
uniform float uTime;
varying vec2 vTex;

void main() {
    float dist  = sqrt(aPos.x * aPos.x + aPos.z * aPos.z) / sqrt(9. * 9. * 2.);
    vTex        = aPos.xz;
    gl_Position = uMVPMatrix * vec4(aPos.x, dist * sin(aPos.y + 10. * uTime) - .5, aPos.z, aPos.w);
}