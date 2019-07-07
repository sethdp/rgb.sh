precision lowp float;
uniform float uTime;

void main() {
    float alpha = step(0., sin(gl_FragCoord.y / 4. + 40. * uTime));
    vec4 color = mix(vec4(1., 1., 1., 1.), vec4(.1, .1, .1, 1.), sin(4. * uTime) / 2. + .5);
    
    float channel = mod(gl_FragCoord.x, 6.);
    if (channel < 2.)
        color *= vec4(1, .3, .3, 1);
    else if (channel < 4.)
        color *= vec4(.3, 1, .3, 1);
    else
        color *= vec4(.3, .3, 1, 1);

    if (mod(gl_FragCoord.y, 6.) < 2.)
        color *= vec4(.8, .8, .8, 1);

    gl_FragColor = alpha * color;
}