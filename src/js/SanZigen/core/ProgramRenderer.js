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
        this.currentSourceIdx = 0;

        this.webGLProgram = new WebGLProgram({
            gl: this.gl,
            vertexShaderSource: params.vertexShaderSource,
            fragmentShaderSource: params.fragmentShaderSource,
            transformFeedbackVaryingArray: params.transformFeedbackVaryingArray,
        });


        this.varyigInfoArray = [];
        for(let ii = 0; ii < params.transformFeedbackVaryingArray.length; ii++){
            let varingVariable = this.gl.getTransformFeedbackVarying(this.webGLProgram.program, ii);
            this.varyigInfoArray.push(varingVariable);
        }


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

    initializeVBOs(attributes){
        this.VAOs = [this.gl.createVertexArray(), this.gl.createVertexArray()];
        this.VBOs = [];
        console.log(attributes);

        for(let ii = 0; ii < this.VAOs.length; ii++){
            this.VBOs[ii] = {};

            this.gl.bindVertexArray(this.VAOs[ii]);

            for(let key in attributes){
                this.VBOs[ii][key] = new Attribute({
                    gl: this.gl,
                    usage: attributes[key].indexArray ? this.gl.STATIC_DRAW : this.gl.STREAM_COPY,
                    itemSize: attributes[key].itemSize,
                    name: attributes[key].name,
                    indexArray: attributes[key].indexArray,
                    data : attributes[key].data,
                    program : this.webGLProgram.program,
                    transformFeedbackVarying : attributes[key].transformFeedbackVarying
                });
                this.VBOs[ii][key].bind();
                this.VBOs[ii][key].findTransformFeedbackVaryingLocation(this.varyigInfoArray);
            }
        }

    }

    initializeTransformFeedback(){
        this.transformFeedback = this.webGLProgram.gl.createTransformFeedback();
    }

    useProgram(){
        this.gl.useProgram(this.webGLProgram.program);
        return this;
    }

    bindTransformFeedback(){
        if(this.transformFeedback) this.gl.bindTransformFeedback(this.gl.TRANSFORM_FEEDBACK, this.transformFeedback);
        return this;
    }
    updateVAO(){
        let sourceVAO = this.VAOs[this.currentSourceIdx];
        this.gl.bindVertexArray(sourceVAO);
    }
    updateVBO(){
        this.currentSourceIdx = (this.currentSourceIdx  + 1) % 2;
        let destVBOs   = this.VBOs[this.currentSourceIdx];

        for(let key in destVBOs){
            destVBOs[key].bindBufferBase();
        }
        
        return this;
    }

    update(){
        return this;
    }
    beginTransformFeedback(primitiveMode = this.gl.POINTS){
        this.gl.beginTransformFeedback(primitiveMode);
        return this;
    }
    draw(){
        return this;
    }
    endTransformFeedback(){
        this.gl.endTransformFeedback();
        return this;
    }

}