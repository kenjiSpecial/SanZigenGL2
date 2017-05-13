#version 300 es

in vec3 aPosition;

uniform vec3 uPosition;
uniform mat4 projectionMatrix;

void main(){

    float xPos =   ( aPosition.x); // + uPosition.x);
    float yPos =  ( aPosition.y); //+ uPosition.y );
    float zPos = aPosition.z + uPosition.z; // + uPosition.z;

    vec4 outputVec = projectionMatrix * vec4(xPos, yPos, zPos, 1.0);

    gl_Position = outputVec; //vec4(aPosition.x, aPosition.y, 0.0, 1.0);
}