
export class Attribute {
    /**
     *
     * @param params = {gl : <webgl2Context>, itemSize : <int>, indexArray : <Boolean>, data : <Float32Array or Uint16Array>, name: <String>, program: <WebGLProgram>, usage: <usage(refer to https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData)> }
     */
    constructor(params) {
        this.gl = params.gl;
        this.itemSize = params.itemSize;
        this.indexArray = !!params.indexArray;
        this.name = params.name;
        this.program = params.program;
        this.usage = params.usage || this.gl.STATIC_DRAW;
        this.transformFeedbackVarying = params.transformFeedbackVarying;

        if(!this.indexArray){
            this.location = this.gl.getAttribLocation(this.program, this.name);
            this.type = params.type;

            if(typeof this.location === -1){
                console.error(`[Attribute.js]: attribute ${this.name} is not defined`)
                return -1;
            }
        }

        this.buffer = this.gl.createBuffer();
        this.bindTarget = this.indexArray ? this.gl.ELEMENT_ARRAY_BUFFER : this.gl.ARRAY_BUFFER;

        this.updateData(params.data);
    }
    updateData(data){
        this.data = data;
        this.gl.bindBuffer(this.bindTarget, this.buffer);
        this.gl.bufferData(this.bindTarget, this.data, this.usage);
    }
    bind(){
        this.gl.bindBuffer(this.bindTarget, this.buffer);

        if(!this.indexArray){
            this.gl.vertexAttribPointer(this.location, this.itemSize, this.gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(this.location);
        }
    }
    findTransformFeedbackVaryingLocation(varyigInfoArray){
        if(this.transformFeedbackVarying){
            this.varyingLocation  = varyigInfoArray.findIndex(varyigInfo=>varyigInfo.name === this.transformFeedbackVarying );
        }else{
            this.varyingLocation = -1;
        }
    }
    bindBufferBase(){
        if(this.varyingLocation >= 0){
            this.gl.bindBufferBase( this.gl.TRANSFORM_FEEDBACK_BUFFER, this.varyingLocation, this.buffer);
        }
    }

}