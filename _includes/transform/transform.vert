uniform bool clip;
varying vec4 pos;
varying vec3 vertexColor;

void main() {
  vertexColor = color;
  pos = modelMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * viewMatrix * pos;
}