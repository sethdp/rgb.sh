precision lowp float;
uniform ivec4 uDims;
uniform float uTime;

void main() {
    float x = (gl_FragCoord.x / float(uDims.x) - .5) * float(uDims.z) / float(uDims.w);
    float y = gl_FragCoord.y / float(uDims.y) - .5;

    float alpha = step(0., sin(gl_FragCoord.y / 4. + 40. * uTime));

    vec4 color;
    if (x * x + y * y <= .09)
        color = vec4(1, sin(4. * uTime) / 2. + .5, 0, alpha);

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