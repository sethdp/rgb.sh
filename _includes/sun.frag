uniform float time;

void main() {
    float a = floor(sin(gl_FragCoord.y / 8. + 40. * time) + 1.);
    gl_FragColor = vec4(0, 1, 1, a);
}