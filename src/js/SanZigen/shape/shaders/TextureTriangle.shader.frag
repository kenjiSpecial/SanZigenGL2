#version 300 es
precision mediump float;

uniform sampler2D uSampler;

in vec2 vUv;
out vec4 outColor;

void main() {
  outColor = texture(uSampler, vUv);
}