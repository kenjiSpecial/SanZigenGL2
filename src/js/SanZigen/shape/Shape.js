"use strict";
const EventEmitter = require('eventemitter3');
import {Uniform} from '../renderers/webgl/Uniform';
import {Attribute} from '../renderers/webgl/Attribute';

export  class Shape extends EventEmitter{
    constructor(params) {
        super();
        params = params || {};
        this.uniforms = {};
        this.attributes = {};
        this.renderer = params.renderer;
        this.gl = this.renderer.gl;
        this.program = this.renderer.createProgram(params.vertexShaderSource, params.fragmentShaderSource);

        this._initializeUniforms();
    }
    _initializeUniforms(){
        let numUniforms = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_UNIFORMS);

        for(let ii = 0; ii < numUniforms; ii++){
            let uniformInfo = this.gl.getActiveUniform(this.program, ii);
            let uniformHandle = this.gl.getUniformLocation(this.program, uniformInfo.name);
            this.uniforms[uniformInfo.name] = new Uniform({ uniformInfo : uniformInfo, uniformHandle : uniformHandle, gl: this.gl });
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