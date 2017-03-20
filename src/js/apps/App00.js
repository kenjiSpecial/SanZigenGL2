'use strict';

import { webGLShader, WebGLRenderer } from '../SanZigen'
const TweenMax = require('gsap');

const THREE = require('three');
const vertexShaderSource = `#version 300 es
in vec4 aPosition;

void main(){
    gl_Position = aPosition;
}
`;

const fragmentShaderSource = `#version 300 es
precision mediump float;

out vec4 outColor;

void main() {
  // Just set the output to a constant redish-purple
  outColor = vec4(1, 0, 0.5, 1);
}
`


export default class App {
    constructor(params){
        this.renderer = new WebGLRenderer({alpha : true});
        this.program = this.renderer.createProgram(vertexShaderSource, fragmentShaderSource);

        this._addAttributes();
        this._addShape0();
        this._addShape1();

        this.domElement = this.renderer.domElement;
    }
    _addAttributes(){

        let gl = this.renderer.gl;
        let program = this.program;
        gl.bindAttribLocation( program, 0, "aPosition" );
        let positionAttributeLocation = gl.getAttribLocation(program, "aPosition");

        let positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        let positions = [
            0, 0,
            0, 0.5,
            0.7, 0,
        ];

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        this.positionAttributeLocation = positionAttributeLocation;
    }
    _addShape0(){
        let gl = this.renderer.gl;

        this.shape0Vao = gl.createVertexArray();
        gl.bindVertexArray(this.shape0Vao);
        gl.enableVertexAttribArray(this.positionAttributeLocation);

        gl.vertexAttribPointer(this.positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    }
    _addShape1(){
        let gl = this.renderer.gl;

        let program = this.program;
        let positinoAttributeLocation2 = gl.getAttribLocation(program, "aPosition");

        let postionBuffer2 = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, postionBuffer2);
        let positions = [
            -0.2, -0.2,
            -0.2, -0.3,
            -0.5, 0
        ]

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions),  gl.STATIC_DRAW);
        this.positionAttributeLocation2 = positinoAttributeLocation2;

        this.shape1Vao = gl.createVertexArray();
        gl.bindVertexArray(this.shape1Vao);
        gl.enableVertexAttribArray(this.positionAttributeLocation2);
        gl.vertexAttribPointer(this.positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    }
    _addGui(){
        this.gui = new dat.GUI();
    }

    animateIn(){
        TweenMax.ticker.addEventListener('tick', this.loop, this);
    }

    loop(){
        let gl = this.renderer.gl;

        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(this.program);
        gl.bindVertexArray(this.shape0Vao);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        gl.useProgram(this.program);
        gl.bindVertexArray(this.shape1Vao);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        console.log(
            gl.getProgramParameter(this.program, gl.DELETE_STATUS)
        );

        if(this.stats) this.stats.update();
    }

    animateOut(){
        TweenMax.ticker.removeEventListener('tick', this.loop, this);
    }

    onMouseMove(mouse){

    }

    onKeyDown(ev){
        switch(ev.which){
            case 27:
                this.isLoop = !this.isLoop;
                if(this.isLoop){
                    this.clock.stop();
                    TweenMax.ticker.addEventListener('tick', this.loop, this);
                }else{
                    this.clock.start();
                    TweenMax.ticker.removeEventListener('tick', this.loop, this);
                }
                break;
        }
    }

    resize(){
        this.renderer.setSize( window.innerWidth, window.innerHeight);
    }

    destroy(){

    }

}
