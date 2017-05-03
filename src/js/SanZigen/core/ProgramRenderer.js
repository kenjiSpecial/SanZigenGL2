"use strict";
const EventEmitter = require('eventemitter3');
import {WebGLProgram} from '../renderers/webgl/WebGLProgram';
import {Attribute} from './Attribute';
import {Uniform} from './Uniform';

export class ProgramRenderer extends EventEmitter {
    constructor(params = {}){
        super();

        if(!params.renderer) console.error(`params.rendere is not defined. ${params.renderer}`);

        this.renderer = params.renderer;
        this.gl = this.renderer.gl;

        this.webGLProgram = new WebGLProgram({
            gl: this.gl,
            vertexShaderSource: params.vertexShaderSource,
            fragmentShaderSource: params.fragmentShaderSource,
            transformFeedbackVaryingArray: params.transformFeedbackVaryingArray,
        });

        this._setUniforms();
        this.initializeShape();
    }

    _setUniforms(){
        let numberOfUniforms = this.webGLProgram.gl.getProgramParameter(this.webGLProgram.program, this.webGLProgram.gl.ACTIVE_UNIFORMS);

        this.webGLProgram.uniforms = {};

        for(let ii = 0; ii < numberOfUniforms; ii++){
            let uniformInfo = this.webGLProgram.gl.getActiveUniform(this.webGLProgram.program, ii);
            let uniformLocation = this.webGLProgram.gl.getUniformLocation(this.webGLProgram.program, uniformInfo.name);
            this.webGLProgram.uniforms[uniformInfo.name] = new Uniform({
                gl: this.webGLProgram.gl,
                uniformInfo: uniformInfo,
                uniformLocation: uniformLocation,
            });
        }
    }

    initializeShape(){

    }

    // let shapeAttributes = {
    // positions : {name : 'aPosition', itemSize : 2, data: this.vertices},
    // indices: {name: 'indices', indexArray: true, data: new Uint16Array(indices)},
    // };
    initializeVBOs(attributes){
        this.VAOs = [this.gl.createVertexArray(), this.gl.createVertexArray()];
        this.VBOs = [];
        console.log(attributes);

        for(let ii = 0; ii < this.VAOs.length; ii++){
            this.VBOs[ii] = {};

            this.gl.bindVertexArray(this.VAOs[ii]);

            for(let key in attributes){
                console.log(key);
                this.VBOs[ii][key] = new Attribute({
                    gl: this.gl,
                    usage: this.gl.STREAM_COPY,
                    itemSize: attributes[key].itemSize,
                    name: attributes[key].name,
                    indexArray: attributes[key].indexArray,
                    data : attributes[key].data,
                });
                this.VBOs[ii][key].bind();
            }
        }

    }

    initializeTransformFeedback(){
        this.transformFeedback = this.webglProgram.gl.createTransformFeedback();
    }

    useProgram(){
        this.gl.useProgram(this.webglProgram.program);
        return this;
    }

    bindTransformFeedback(){
        if(this.transformFeedback) this.gl.bindTransformFeedback(this.gl.TRANSFORM_FEEDBACK, this.transformFeedback);
        return this;
    }

    update(){
        return;
    }

    draw(){

    }
}