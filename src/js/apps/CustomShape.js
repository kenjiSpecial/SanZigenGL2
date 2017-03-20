"use strict";

import {Shape} from '../SanZigen'
const vertexShaderSource = `#version 300 es

in vec2 aPosition;

uniform vec2 uWindow;
uniform vec2 uSize;
uniform vec2 uPosition;

void main(){
    float xPos =   ( uPosition.x + uSize.x * aPosition.x ) / uWindow.x * 2.0 - 1.0;
    float yPos = - ( uPosition.y + uSize.y * aPosition.y ) / uWindow.y * 2.0 + 1.0;
    
    gl_Position = vec4(xPos, yPos, 0.0, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es
precision mediump float;

uniform float uColor;

out vec4 outColor;

void main() {
  // Just set the output to a constant redish-purple
  outColor = vec4(1, uColor, 0.5, 1);
}
`

export default class CustomShape extends Shape{
    constructor(params) {
        super({
            renderer : params.renderer,
            vertexShaderSource : vertexShaderSource,
            fragmentShaderSource : fragmentShaderSource
        });

        this.x = params.x ? params.x : 500;
        this.y = params.y ? params.y : 200;
        this.width = params.width ? params.width : 200;
        this.height = params.height ? params.height : 120;

        this._createShape();

        this.resize();
    }
    _createShape(){
        let indices = [
            0, 1, 2,
            2, 3, 0
        ];

        let positions = [
            -0.5, -0.5,
            -0.5,  0.5,
            0.5,  0.5,
            0.5, -0.5
        ];

        let shapeAttributes = {
            indices: {name : 'indices', indexArray: true, data: new Uint16Array(indices)},
            positions : {name : 'aPosition', itemSize : 2, data : new Float32Array(positions)}
        };

        this.shapeVao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.shapeVao);

        this.initializeAttributes(shapeAttributes);

    }
    _updateUniforms(){
        this.uniforms['uPosition'].set2f( this.x, this.y);
        this.uniforms['uSize'].set2f( this.width, this.height);
        this.uniforms['uWindow'].set2f( window.innerWidth, window.innerHeight );
    }
    update(dt = 1/60){
        if(!this.time) this.time = 0;
        this.time += dt;

        this.x = window.innerWidth/2 + 300 * Math.cos(this.time );
        this.y = window.innerHeight/2 + 300 * Math.sin(this.time );

        return this;
    }
    draw(){
        let gl = this.renderer.gl;

        gl.useProgram(this.program);
        gl.bindVertexArray(this.shapeVao);

        this._updateUniforms();
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
        return this;
    }
    resize(){

    }
}