#version 300 es

in vec2 aPosition;
in vec2 aUv;

uniform vec2 uWindow;
uniform vec2 uPosition;
uniform float uRotation;

out vec2 vUv;

void main(){
    float cosRot = cos(uRotation);
    float sinRot = sin(uRotation);
    mat3 m = mat3(
        cosRot, sinRot, 0.0,
        -sinRot, cosRot, 0.0,
        0.0, 0.0, 1.0
    );
    vec3 shapePosition = vec3(aPosition, 1.0);
    vec3 curShapePosition = m * shapePosition;

    float xPos =   ( uPosition.x + curShapePosition.x ) / uWindow.x * 2.0 - 1.0;
    float yPos = - ( uPosition.y + curShapePosition.y ) / uWindow.y * 2.0 + 1.0;

    vUv = aUv;

    gl_Position = vec4(xPos, yPos, 0.0, 1.0);
}