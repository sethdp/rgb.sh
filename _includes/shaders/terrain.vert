attribute vec4 aPos;
uniform mat4 uMVPMatrix;
uniform float uTime;
varying lowp vec2 vTex;

void main() {
    vec4 pos = aPos;
    float dist = sqrt(pos.x * pos.x + pos.z * pos.z) / sqrt(9. * 9. * 2.);
    pos.y = dist * sin(pos.y + 10. * uTime) - .5;

    vTex = pos.xz;
    gl_Position = uMVPMatrix * pos;
}