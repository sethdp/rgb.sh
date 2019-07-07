precision lowp float;
uniform float uTime;
varying vec2 vTex;

void main() {
    const float thr = .02;
    float alpha = .1;
    vec2 tex = fract(vTex);

    if (tex.x < thr || tex.x > 1. - thr || tex.y < thr || tex.y > 1. - thr ||
        (tex.y + tex.x > 1. - thr && tex.y + tex.x < 1. + thr))
        alpha = 1.;

    vec4 color = mix(vec4(1., 1., 1., alpha), vec4(.1, .1, .1, alpha), sin(4. * uTime) / 2. + .5);

    float channel = mod(gl_FragCoord.x, 6.);

    if (channel < 2.)
        color *= vec4(1, .3, .3, 1);
    else if (channel < 4.)
        color *= vec4(.3, 1, .3, 1);
    else
        color *= vec4(.3, .3, 1, 1);

    if (mod(gl_FragCoord.y, 6.) < 2.)
        color *= vec4(.8, .8, .8, 1);

    gl_FragColor = color;
}
