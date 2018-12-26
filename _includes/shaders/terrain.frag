precision lowp float;
uniform float uTime;
varying vec2 vTex;

void main() {
    const float thr = .01;
    float alpha     = 0.1;
    vec2 tex        = fract(vTex);

    if (tex.x < thr || tex.x > 1. - thr ||
        tex.y < thr || tex.y > 1. - thr ||
        (tex.y + tex.x > 1. - thr && tex.y + tex.x < 1. + thr))
        alpha = 1.;

    vec4 color = vec4(1, sin(4. * uTime) / 2. + .5, 0, alpha);

    if (mod(gl_FragCoord.x, 3.) < 1.)
        color *= vec4(1, .3, .3, 1);
    else if (mod(gl_FragCoord.x, 3.) < 2.)
        color *= vec4(.3, 1, .3, 1);
    else
        color *= vec4(.3, .3, 1, 1);

    if (mod(gl_FragCoord.y, 6.) < 1.)
        color *= vec4(.8, .8, .8, 1);

    gl_FragColor = color;
}
