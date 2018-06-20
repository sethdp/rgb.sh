precision lowp float;
varying lowp vec2 vTex;

void main() {
    const float thr = .01;
    float alpha = 0.1;
    vec2 tex = fract(vTex);

    if (tex.x < thr || tex.x > 1.0 - thr || tex.y < thr || tex.y > 1.0 - thr ||
        (tex.y + tex.x > 1.0 - thr && tex.y + tex.x < 1.0 + thr))
        alpha = 1.0;

    gl_FragColor = vec4(1, .078, .576, alpha);
}