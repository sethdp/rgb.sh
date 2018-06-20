precision lowp float;
uniform ivec4 uDims;

void main() {
    float x = (gl_FragCoord.x / float(uDims.x) - .5) * float(uDims.z) / float(uDims.w);
    float y = gl_FragCoord.y / float(uDims.y) - .5;
    float inten = (y + .3) / .6;

    if (x * x + y * y <= .09 && sin(inten * inten * 100.) >= 0.)
        gl_FragColor = vec4(1, .549 * inten, 0, clamp(1.25 * inten - .25, 0., 1.));
}