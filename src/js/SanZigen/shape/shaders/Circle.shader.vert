#version 300 es

in vec2 aPosition;

uniform vec2 uWindow;
uniform vec2 uPosition;

void main(){

    float xPos =   ( aPosition.x + uPosition.x ) / uWindow.x * 2.0 - 1.0;
    float yPos = - ( aPosition.y + uPosition.y ) / uWindow.y * 2.0 + 1.0;

    gl_Position = vec4(xPos, yPos, 0.0, 1.0);
}