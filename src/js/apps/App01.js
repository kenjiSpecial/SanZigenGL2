'use strict';

import { webGLShader, WebGLRenderer } from '../SanJigen/SanJigen/'
const TweenMax = require('gsap');

const vertexShaderSource = `#version 300 es

in vec4 aPosition;

void main(){
    gl_Position = aPosition;
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


export default class App {
    constructor(params){
        this.renderer = new WebGLRenderer({alpha : true});
        this.program = this.renderer.createProgram(vertexShaderSource, fragmentShaderSource);

        this._addAttributes();
        this._addShape0();
        // this._addShape1();

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
            0, 0.2,
            0.7, 0,
            0.5, 0.5,
            0.0, 0.0,
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

        let indices = [
            0, 1, 2,
            0, 2, 3
        ]

        let indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        this.indicesBuffer = indexBuffer;


        let numUniforms = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES);
        for(let ii = 0; ii < numUniforms;ii++){

        }

    }
    _addGui(){
        this.gui = new dat.GUI();
    }

    animateIn(){
        TweenMax.ticker.addEventListener('tick', this.loop, this);
    }

    loop(){
        if(!this.time) this.time = 0;
        this.time += 1/60;

        let gl = this.renderer.gl;

        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);


        gl.useProgram(this.program);

        gl.bindVertexArray(this.shape0Vao);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);

        if( parseInt(this.time * 10) % 2 == 0){
            let uCOlorPosition = gl.getUniformLocation(this.program, 'uColor');
            gl.uniform1f(uCOlorPosition, (Math.cos(this.time) + 1)/2) ;
        }


        gl.drawArrays( gl.TRIANGLE_FAN, 0, 4);

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
