import {webGLShader} from './WebGLShader';

export class WebgGLProgram {
    constructor( params ) {
        this.gl = params.gl;

        this.vertexShader = webGLShader(this.gl, this.gl.VERTEX_SHADER, params.vertexShaderSource);
        this.fragmentShader= webGLShader(this.gl, this.gl.FRAGMENT_SHADER, params.fragmentShaderSource);

        this.program = this.createProgram();
    }
    createProgram(){
        let program = this.gl.createProgram();
        this.gl.attachShader(program, this.vertexShader);
        this.gl.attachShader(program, this.fragmentShader);
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