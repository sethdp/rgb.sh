precision lowp float;
attribute vec2 aPos;
uniform mat4 uMVPMatrix;

void main() {
    gl_Position = uMVPMatrix * vec4(aPos, -10, 1);
}