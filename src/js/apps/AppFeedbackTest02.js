// https://github.com/WebGLSamples/WebGL2Samples/blob/master/samples/transform_feedback_separated_2.html#L246-L278
'use strict';

import {WebGLRenderer, WebGLProgram, Shape, Vector2, TransformFeedback, Clock, Uniform, ProgramRenderer} from 'SanZigen'

const TweenMax = require('gsap');
const Stats = require('stats.js');
const dat = require('dat.gui/build/dat.gui.js');

const POSITION_LOCATION = 0;
const VELOCITY_LOCATION = 1;
const SPAWNTIME_LOCATION = 2;
const LIFETIME_LOCATION = 3;
const ID_LOCATION = 4;
const NUM_LOCATIONS = 5;

const NUM_PARTICLES = 1000;
const ACCELERATION = -1.0;


const vertexShaderSource = `#version 300 es
#define POSITION_LOCATION 0
#define VELOCITY_LOCATION 1
#define SPAWNTIME_LOCATION 2
#define LIFETIME_LOCATION 3
#define ID_LOCATION 4
precision highp float;
precision highp int;
precision highp sampler3D;
uniform float u_time;
uniform vec2 u_acceleration;
layout(location = POSITION_LOCATION) in vec2 a_position;
layout(location = VELOCITY_LOCATION) in vec2 a_velocity;
layout(location = SPAWNTIME_LOCATION) in float a_spawntime;
layout(location = LIFETIME_LOCATION) in float a_lifetime;
layout(location = ID_LOCATION) in float a_ID;
out vec2 v_position;
out vec2 v_velocity;
out float v_spawntime;
out float v_lifetime;
float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
void main()
{
    if (a_spawntime == 0.0 || (u_time - a_spawntime > a_lifetime) || a_position.y < -0.5) {
        // Generate a new particle
        v_position = vec2(0.0, 0.0);
        v_velocity = vec2(rand(vec2(a_ID, 0.0)) - 0.5, rand(vec2(a_ID, a_ID)));
        v_spawntime = u_time;
        v_lifetime = 5000.0;
    } else {
        v_velocity = a_velocity + 0.01 * u_acceleration;
        v_position = a_position + 0.01 * v_velocity;
        v_spawntime = a_spawntime;
        v_lifetime = a_lifetime;
    }
    gl_Position = vec4(v_position, 0.0, 1.0);
    gl_PointSize = 20.0;
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;
precision highp int;
uniform vec4 u_color;
uniform float u_lifetime;
out vec4 color;

void main()
{
    color = u_color;
}
`


export default class App {
    constructor(params){
        this.renderer = new WebGLRenderer();
        this.domElement = this.renderer.domElement;

        this._initializeShape(params);


        this._addGui();
        this._addStats();


        this.resize();
    }

    _initProgram(){

        this.programRenderer = new ProgramRenderer({
            renderer : this.renderer,
            vertexShaderSource: vertexShaderSource,
            fragmentShaderSource: fragmentShaderSource,
            transformFeedbackVaryingArray : ['v_position', 'v_velocity', 'v_spawntime', 'v_lifetime'],
        });

        let particlePosition = new Float32Array(NUM_PARTICLES * 2);
        let particleVelocity = new Float32Array(NUM_PARTICLES * 2);
        let particleSpawnTime = new Float32Array(NUM_PARTICLES);
        let particleLifeTime = new Float32Array(NUM_PARTICLES);
        let particleIDs = new Float32Array(NUM_PARTICLES);


        for(let pp = 0; pp < NUM_PARTICLES; pp++){
            particlePosition[pp * 2] = 0.0;
            particlePosition[pp * 2 + 1] = 0.0;
            particleVelocity[pp * 2] = 0.0;
            particleVelocity[pp * 2 + 1] = 0.0;
            particleSpawnTime[pp] = 0.0;
            particleLifeTime[pp] = 0.0;
            particleIDs[pp] = pp;
        }

        this.programRenderer.initializeVBOs([
            { name: 'a_position',  size: 2, data: particlePosition },
            { name: 'a_velocity',  size: 2, data: particleVelocity },
            { name: 'a_spawntime', size: 1, data: particleSpawnTime},
            { name: 'a_lifetime',  size: 1, data: particleLifeTime},
            { name: 'a_ID', size: 1, data: particleIDs }
        ]);

    }

    _initializeShape(params){

        this.appStartTime = Date.now();
        let curretSourceIdx = 0;

        this._initProgram();

        this.particlePosition = new Float32Array(NUM_PARTICLES * 2);
        this.particleVelocity = new Float32Array(NUM_PARTICLES * 2);
        this.particleSapwntime = new Float32Array(NUM_PARTICLES);
        this.particleLifeTime = new Float32Array(NUM_PARTICLES);
        this.particleIDs = new Float32Array(NUM_PARTICLES);


        for(let pp = 0; pp < NUM_PARTICLES; pp++){
            this.particlePosition[pp * 2] = 0.0;
            this.particlePosition[pp * 2 + 1] = 0.0;
            this.particleVelocity[pp * 2] = 0.0;
            this.particleVelocity[pp * 2 + 1] = 0.0;
            this.particleSapwntime[pp] = 0.0;
            this.particleLifeTime[pp] = 0.0;
            this.particleIDs[pp] = pp;
        }


        // init vertex arrays and buffers
        this.particleVAOs = [this.webglProgram.gl.createVertexArray(), this.webglProgram.gl.createVertexArray()];
        this.particleVBOs = [];

        console.log(this.webglProgram.gl.getAttribLocation(this.webglProgram.program, 'a_position'));
        for(let ii = 0; ii < this.particleVAOs.length; ii++){
            this.particleVBOs[ii] = [];

            this.webglProgram.gl.bindVertexArray(this.particleVAOs[ii]);

            this.particleVBOs[ii][POSITION_LOCATION] = this.webglProgram.gl.createBuffer();
            this.webglProgram.gl.bindBuffer(this.webglProgram.gl.ARRAY_BUFFER, this.particleVBOs[ii][POSITION_LOCATION]);
            this.webglProgram.gl.bufferData(this.webglProgram.gl.ARRAY_BUFFER, this.particlePosition, this.webglProgram.gl.STREAM_COPY );
            this.webglProgram.gl.vertexAttribPointer(POSITION_LOCATION, 2, this.webglProgram.gl.FLOAT, false, 0, 0);
            this.webglProgram.gl.enableVertexAttribArray(POSITION_LOCATION);
            console.log(this.webglProgram.gl.getAttribLocation(this.webglProgram.program, 'a_position'));

            this.particleVBOs[ii][VELOCITY_LOCATION] = this.webglProgram.gl.createBuffer();
            this.webglProgram.gl.bindBuffer(this.webglProgram.gl.ARRAY_BUFFER, this.particleVBOs[ii][VELOCITY_LOCATION]);
            this.webglProgram.gl.bufferData(this.webglProgram.gl.ARRAY_BUFFER, this.particleVelocity, this.webglProgram.gl.STREAM_COPY );
            this.webglProgram.gl.vertexAttribPointer(VELOCITY_LOCATION, 2, this.webglProgram.gl.FLOAT, false, 0, 0);
            this.webglProgram.gl.enableVertexAttribArray(VELOCITY_LOCATION);

            this.particleVBOs[ii][SPAWNTIME_LOCATION] = this.webglProgram.gl.createBuffer();
            this.webglProgram.gl.bindBuffer(this.webglProgram.gl.ARRAY_BUFFER, this.particleVBOs[ii][SPAWNTIME_LOCATION]);
            this.webglProgram.gl.bufferData(this.webglProgram.gl.ARRAY_BUFFER, this.particleSapwntime, this.webglProgram.gl.STREAM_COPY );
            this.webglProgram.gl.vertexAttribPointer(SPAWNTIME_LOCATION, 1, this.webglProgram.gl.FLOAT, false, 0, 0);
            this.webglProgram.gl.enableVertexAttribArray(SPAWNTIME_LOCATION);

            this.particleVBOs[ii][LIFETIME_LOCATION] = this.webglProgram.gl.createBuffer();
            this.webglProgram.gl.bindBuffer(this.webglProgram.gl.ARRAY_BUFFER, this.particleVBOs[ii][LIFETIME_LOCATION]);
            this.webglProgram.gl.bufferData(this.webglProgram.gl.ARRAY_BUFFER, this.particleLifeTime, this.webglProgram.gl.STREAM_COPY );
            this.webglProgram.gl.vertexAttribPointer(LIFETIME_LOCATION, 1, this.webglProgram.gl.FLOAT, false, 0, 0);
            this.webglProgram.gl.enableVertexAttribArray(LIFETIME_LOCATION);

            this.particleVBOs[ii][ID_LOCATION] = this.webglProgram.gl.createBuffer();
            this.webglProgram.gl.bindBuffer(this.webglProgram.gl.ARRAY_BUFFER, this.particleVBOs[ii][ID_LOCATION]);
            this.webglProgram.gl.bufferData(this.webglProgram.gl.ARRAY_BUFFER, this.particleIDs, this.webglProgram.gl.STREAM_COPY );
            this.webglProgram.gl.vertexAttribPointer(ID_LOCATION, 1, this.webglProgram.gl.FLOAT, false, 0, 0);
            this.webglProgram.gl.enableVertexAttribArray(ID_LOCATION);
        }


        this.transformFeedback = this.webglProgram.gl.createTransformFeedback();
        // this.webglProgram.gl.bindTransformFeedback( this.webglProgram.gl.TRANSFORM_FEEDBACK, this.transformFeedback);

        // this.gl.bindTransformFeedback()
    }

    _addGui(){
        this.gui = new dat.GUI();
        this.playAndStopGui = this.gui.add(this, '_playAndStop').name('pause');
    }

    _addStats(){
        this.stats = new Stats();
        document.body.appendChild(this.stats.dom);
    }

    animateIn(){
        this.isLoop = false;
        this.currentSourceIdx = 0;

        if(this.isLoop) TweenMax.ticker.addEventListener('tick', this.loop, this);
        else            this.loop();
    }

    loop(){
        let time = Date.now() - this.appStartTime;

        let gl = this.renderer.gl;

        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(this.webglProgram.program);
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.transformFeedback);

        this.webglProgram.uniforms['u_color'].set4f(0.0, 1.0, 1.0, 1.0);
        this.webglProgram.uniforms['u_acceleration'].set2f(0.0, -1.0);
        this.webglProgram.uniforms['u_time'].set1f(time);

        let sourceVAO = this.particleVAOs[this.currentSourceIdx];
        let destinationVBO = this.particleVBOs[(this.currentSourceIdx + 1) % 2];
        // console.log(this.particleVBOs.length);

        gl.bindVertexArray(sourceVAO);
        // Set transform feedback buffer
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, destinationVBO[POSITION_LOCATION]);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, destinationVBO[VELOCITY_LOCATION]);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 2, destinationVBO[SPAWNTIME_LOCATION]);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 3, destinationVBO[LIFETIME_LOCATION]);
        // Set uniforms
        // gl.uniform1f(drawTimeLocation, time);

        // Draw particles using transform feedback
        gl.beginTransformFeedback(gl.POINTS);
        gl.drawArrays(gl.POINTS, 0, NUM_PARTICLES);
        gl.endTransformFeedback();

        this.currentSourceIdx = (this.currentSourceIdx + 1) % 2;




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
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    destroy(){

    }

}
