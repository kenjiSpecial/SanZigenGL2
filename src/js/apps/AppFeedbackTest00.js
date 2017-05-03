'use strict';

import { WebGLRenderer, Shape, Vector2, TransformFeedback} from 'SanZigen'

const TweenMax = require('gsap');
const Stats = require('stats.js');
const dat = require('dat.gui/build/dat.gui.js');

const vertexShaderSource = `
#version 300 es
in vec4 aPos;
void main(void) {
   gl_PointSize = 20.;
   gl_Position = vec4(-aPos.x, aPos.yzw);
}
`;

const fragmentShaderSource = `
#version 300 es
precision highp float;
  out vec4 fragColor;
void main(void) {
   fragColor = vec4( 1.,0.,0., 1. );
}
`

class Particle extends Shape {
    constructor(params) {
        super(params);

        this.aPosLoc = this.gl.getAttribLocation(this.program, 'aPos');
        this.gl.enableVertexAttribArray(this.aPosLoc);
        // console.log(this.aPosLoc);

        this.bufA = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bufA)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([.8, 0, 0, 1]), this.gl.DYNAMIC_COPY);

        this.bufB = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bufB)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, 4 * 4, this.gl.DYNAMIC_COPY);

        this.transformFeedback = this.gl.createTransformFeedback();
        this.gl.bindTransformFeedback(this.gl.TRANSFORM_FEEDBACK, this.transformFeedback);
    }
    update(){
        return this;
    }
    draw(){
        this.gl.useProgram(this.program);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bufA);
        this.gl.vertexAttribPointer(this.aPosLoc, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.bindBufferBase(this.gl.TRANSFORM_FEEDBACK_BUFFER, this.aPosLoc, this.bufB);

        this.gl.beginTransformFeedback(this.gl.POINTS)
        this.gl.drawArrays(this.gl.POINTS, 0, 1)
        this.gl.endTransformFeedback()

        this.gl.bindBufferBase(this.gl.TRANSFORM_FEEDBACK_BUFFER, 0, null)

        let t = this.bufB; this.bufB = this.bufA; this.bufA = t;

        return this;
    }
}

export default class App {
    constructor(params){
        this.renderer = new WebGLRenderer();
        this.domElement = this.renderer.domElement;

        this._initializeShape(params);


        this._addGui();
        this._addStats();


        this.resize();
    }

    _initializeShape(params){

        this.shape = new Particle({
            renderer : this.renderer,
            vertexShaderSource : vertexShaderSource.trim(),
            fragmentShaderSource : fragmentShaderSource.trim(),
            transformFeedbackVaryingArray : ['gl_Position']
        });

    }

    _addGui(){
        this.gui = new dat.GUI();
        this.playAndStopGui = this.gui.add(this, '_playAndStop').name('pause');
    }

    _addStats(){
        this.stats = new Stats();
        document.body.appendChild( this.stats.dom );
    }

    animateIn(){
        this.isLoop = true;
        TweenMax.ticker.addEventListener('tick', this.loop, this);
    }

    loop(){
        let gl = this.renderer.gl;

        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // console.log(this.shape);
        this.shape.update().draw();
    }

    animateOut(){
        TweenMax.ticker.removeEventList4ener('tick', this.loop, this);
    }

    onMouseMove(mouse){

    }

    onKeyDown(ev){
        switch(ev.which){
            case 27:
                this._playAndStop();
                break;
        }
    }

    _playAndStop(){
        this.isLoop = !this.isLoop;
        if(this.isLoop){
            TweenMax.ticker.addEventListener('tick', this.loop, this);
            this.playAndStopGui.name('pause');
        }else{
            TweenMax.ticker.removeEventListener('tick', this.loop, this);
            this.playAndStopGui.name('play');
        }
    }

    resize(){
        this.renderer.setSize( window.innerWidth, window.innerHeight);
    }

    destroy(){

    }

}
