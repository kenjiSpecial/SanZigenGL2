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

const NUM_PARTICLES = 100000;
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
    gl_PointSize = 0.1;
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
            { name: 'a_position',  itemSize: 2, data: particlePosition,  transformFeedbackVarying: 'v_position' },
            { name: 'a_velocity',  itemSize: 2, data: particleVelocity,  transformFeedbackVarying: 'v_velocity' },
            { name: 'a_spawntime', itemSize: 1, data: particleSpawnTime, transformFeedbackVarying: 'v_spawntime' },
            { name: 'a_lifetime',  itemSize: 1, data: particleLifeTime,  transformFeedbackVarying: 'v_lifetime' },
            { name: 'a_ID', itemSize: 1, data: particleIDs }
        ]);

    }

    _initializeShape(params){
        this._initProgram();
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
        this.isLoop = true;
        this.currentSourceIdx = 0;
        this.appStartTime = Date.now();

        if(this.isLoop) TweenMax.ticker.addEventListener('tick', this.loop, this);
        else            this.loop();
    }

    loop(){
        let time = Date.now() - this.appStartTime;

        let gl = this.renderer.gl;

        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        this.programRenderer.useProgram().bindTransformFeedback();

        this.programRenderer.webGLProgram.uniforms['u_color'].set4f(0.0, 1.0, 1.0, 1.0);
        this.programRenderer.webGLProgram.uniforms['u_acceleration'].set2f(0.0, -1.0);
        this.programRenderer.webGLProgram.uniforms['u_time'].set1f(time);

        this.programRenderer.updateVAO();
        this.programRenderer.updateVBO();
        this.programRenderer.beginTransformFeedback();
        this.programRenderer.gl.drawArrays(gl.POINTS, 0, NUM_PARTICLES);
        this.programRenderer.endTransformFeedback()
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
