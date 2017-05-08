#version 300 es

in vec2 aPosition;

uniform vec2 uWindow;
uniform vec3 uPosition;
uniform float uDepth;

void main(){

    float xPos =   ( aPosition.x + uPosition.x ) / uWindow.x * 2.0 - 1.0;
    float yPos = - ( aPosition.y + uPosition.y ) / uWindow.y * 2.0 + 1.0;
    float zPos = uDepth;

    gl_Position = vec4(xPos, yPos, zPos, 1.0);
}