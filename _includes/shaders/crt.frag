precision lowp float;
uniform sampler2D uSampler;
uniform float uTime;
varying lowp vec2 vPos;

void main() {
    int x = int(gl_FragCoord.x);
    int mx = x - x / 3 * 3;
    int y = int(gl_FragCoord.y);
    int my = y - y / 3 * 3;

    vec4 t = texture2D(uSampler, vPos);
    vec3 color = vec3(mx == 0 ? 1. : .5,
                        mx == 1 ? 1. : .5,
                        mx == 2 ? 1. : .5);
    float scanline = my == 0 ? .3 : 1.;

    gl_FragColor = vec4(2. * t.xyz * color * scanline, 1);
}