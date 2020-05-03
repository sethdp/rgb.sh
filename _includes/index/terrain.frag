precision lowp float;
uniform float uTime;
varying vec2 vTex;

void main() {
    const float thr = .02;
    float alpha = .4;
    vec2 tex = fract(vTex);

    if (tex.x < thr || tex.x > 1. - thr || tex.y < thr || tex.y > 1. - thr ||
        (tex.y + tex.x > 1. - thr && tex.y + tex.x < 1. + thr))
        alpha = 1.;

    vec4 color = vec4(1., 0., 1., alpha);

    gl_FragColor = color;
}
