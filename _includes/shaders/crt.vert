attribute vec2 aPos;
varying lowp vec2 vPos;

void main() {
    gl_Position = vec4(aPos.x * 2. - 1., aPos.y * 2. - 1., 0., 1.);
    vPos = aPos;
}