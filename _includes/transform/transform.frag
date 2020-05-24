uniform bool clip;
varying vec4 pos;
varying vec3 vertexColor;

void main() {
  if (clip && any(greaterThan(abs(pos.xyz), vec3(pos.w)))) {
    gl_FragColor = vec4(vertexColor / 2., 1);
  } else {
    gl_FragColor = vec4(vertexColor, 1);
  }
}