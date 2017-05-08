#version 300 es
precision mediump float;

uniform vec3 uColor;

out vec4 outColor;

void main() {
  // Just set the output to a constant redish-purple
  outColor = vec4(uColor, 1);
}