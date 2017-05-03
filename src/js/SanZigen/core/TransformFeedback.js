//referred code
// https://github.com/kenjiSpecial/three.js/blob/dev/examples/js/postprocessing/EffectComposer.js

export class TransformFeedback {
    constructor(params) {
        this.gl = params.gl;
        this.program = params.program;
        this.name = params.name;
        this.data = new Float32Array(params.data);

        this.location = this.gl.getAttribLocation(this.program, this.name);
        if(this.location === -1){
            console.error(`Attribute ${this.name} is not found.`);
            return;
        }

        this.bufferA = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bufferA);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.data, this.gl.DYNAMIC_COPY);

        this.bufferB = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bufferA);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.data.length * Float32Array.BYTES_PER_ELEMENT, this.gl.DYNAMIC_COPY);

        this.transformFeedback = this.gl.createTransformFeedback();


        this.readBuffer = this.bufferA;
        this.writeBuffer = this.bufferB;
    }
    bind(){
        this.gl.bindTransformFeedback(this.gl.TRANSFORM_FEEDBACK, this.transformFeedback);
    }
    swap(){
        let temp = this.readBuffer;
        this.readBuffer = this.writeBuffer;
        this.readBuffer = temp;
    }
}