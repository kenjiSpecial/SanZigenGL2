'use strict';

import { webGLShader, WebGLRenderer } from '../SanZigen'

import CustomShape from './CustomShape';

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
        this.shape = new CustomShape({
            renderer : this.renderer,
        });

        this.domElement = this.renderer.domElement;
    }

    _addGui(){
        this.gui = new dat.GUI();
    }

    animateIn(){
        TweenMax.ticker.addEventListener('tick', this.loop, this);
    }
    _updateShape(){

    }
    loop(){
        if(!this.time) this.time = 0;
        this.time += 1/60;

        let gl = this.renderer.gl;

        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        /**
        gl.useProgram(this.program);
        this._updateShape();
        gl.bindVertexArray(this.shape0Vao);

        let uCOlorPosition = gl.getUniformLocation(this.program, 'uColor');
        gl.uniform1f(uCOlorPosition, (Math.cos(this.time) + 1)/2) ;

        gl.drawArrays( gl.TRIANGLE_FAN, 0, 4);
         */
        this.shape
                .update()
                .draw();

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
