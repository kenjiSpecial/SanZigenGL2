#version 300 es
precision mediump float;

uniform vec3 uColor;

out vec4 outColor;


void main(){
    outColor = vec4(uColor, 1.0);
}