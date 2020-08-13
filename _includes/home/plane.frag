uniform float time;
varying vec2 pos;

void main() {
    float a = .4;
    const float thr = .02;
    vec2 tex = fract(pos);
    if (tex.x < thr || tex.x > 1. - thr || tex.y < thr || tex.y > 1. - thr)
        a = 1.;
    gl_FragColor = vec4(1, 0, 1, a);
}