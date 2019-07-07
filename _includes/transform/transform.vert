attribute vec3 aColor;
attribute vec3 aPos;
uniform mat4 uTrans;
uniform mat4 uVP;
uniform bool uNDC;
varying vec3 vColor;
varying vec3 vPos;

void main() {
  gl_PointSize = 10.;
  vColor = aColor;
  gl_Position = uTrans * vec4(aPos, 1);
  if (uNDC) {
    gl_Position /= gl_Position.w;
    vPos = gl_Position.xyz;
    gl_Position = uVP * gl_Position;
  }
}