precision lowp float;
varying vec3 vColor;
varying vec3 vPos;

void main() {
  if (abs(vPos.x) > 1. || abs(vPos.y) > 1. || abs(vPos.z) > 1.)
    discard;
  gl_FragColor = vec4(vColor, 1);
}