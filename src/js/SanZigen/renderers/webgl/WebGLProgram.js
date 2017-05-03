import {webGLShader} from './WebGLShader';

export class WebGLProgram {
    constructor( params ) {
        this.gl = params.gl;
        this._transformFeedbackVaryingArray = params.transformFeedbackVaryingArray;

        this.vertexShader = webGLShader(this.gl, this.gl.VERTEX_SHADER, params.vertexShaderSource);
        this.fragmentShader= webGLShader(this.gl, this.gl.FRAGMENT_SHADER, params.fragmentShaderSource);

        this.program = this.createProgram();
    }
    createProgram(){
        let program = this.gl.createProgram();
        this.gl.attachShader(program, this.vertexShader);
        this.gl.attachShader(program, this.fragmentShader);

        if(this._transformFeedbackVaryingArray &&  Array.isArray(this._transformFeedbackVaryingArray))
            this.gl.transformFeedbackVaryings(program, this._transformFeedbackVaryingArray, this.gl.SEPARATE_ATTRIBS );
        this.gl.linkProgram(program);

        try{
            let success = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
            if(!success) throw this.gl.getProgramInfoLog(this.program);
        }catch (error){
            console.error(`WebGLProgram: ${error}`)
        }

        return program;
    }
}