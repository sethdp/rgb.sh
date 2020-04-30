precision lowp float;
uniform float uTime;

void main() {
    float alpha = step(0., sin(gl_FragCoord.y / 4. + 40. * uTime));
    gl_FragColor = vec4(0., 1., 1., alpha);
}