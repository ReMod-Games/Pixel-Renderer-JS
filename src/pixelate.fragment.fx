precision highp float;

# Samplers
varying vec2 vUV;
uniform sampler2D textureSampler;

# Parameters
uniform vec4 resolution;

void main() {
    vec2 iuv = (floor(resolution.xy * vUV) + .5) * resolution.zw;
    vec4 texel = texture2D( textureSampler, iuv );
    gl_FragColor = texel;
}