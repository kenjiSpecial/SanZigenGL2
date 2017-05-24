"use strict";
const EventEmitter = require('eventemitter3');
import {Uniform} from '../core/Uniform';
import {Attribute} from '../core/Attribute';

export  class Shape extends EventEmitter{
    constructor(params) {
        super();
        params = params || {};
        this.uniforms = {};
        this.attributes = {};
        try {
            this.renderer = params.renderer;
            if(this.renderer === undefined){
                throw 'renderer is undefined.';
            }
        }catch(e){
            console.error(e);
        }

        this.gl = this.renderer.gl;
        this.program = this.renderer.createProgram(params.vertexShaderSource, params.fragmentShaderSource, {
            transformFeedbackVaryingArray : params.transformFeedbackVaryingArray
        });

        this._initializeUniforms();
    }
    _initializeUniforms(){
        let numUniforms = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_UNIFORMS);

        for(let ii = 0; ii < numUniforms; ii++){
            let uniformInfo = this.gl.getActiveUniform(this.program, ii);
            let uniformLocation = this.gl.getUniformLocation(this.program, uniformInfo.name);
            this.uniforms[uniformInfo.name] = new Uniform({ uniformInfo : uniformInfo, uniformLocation : uniformLocation, gl: this.gl });
        }
    }
    initializeAttributes(attributes){
        
        for(let key in attributes){
            this.attributes[key] = new Attribute({
                gl : this.gl,
                program : this.program,
                itemSize : attributes[key].itemSize,
                data : attributes[key].data,
                name : attributes[key].name,
                indexArray : attributes[key].indexArray,
            });
            this.attributes[key].bind();
        }

    }
    draw(){
        this.renderer.gl.useProgram(this.program);
    }
}