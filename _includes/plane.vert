uniform float time;
varying vec2 pos;

void main() {
    float z = sin(position.z + 8. * time) / 8.;
    pos = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, position.y, z, 1.0);
}