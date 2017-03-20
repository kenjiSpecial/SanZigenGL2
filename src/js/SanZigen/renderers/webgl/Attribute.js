
export class Attribute {
    /**
     *
     * @param params( gl, itemSize, indexArray, data, name, program, indexArray )
     * @return {number}
     */
    constructor(params) {
        this.gl = params.gl;
        this.itemSize = params.itemSize;
        this.indexArray = !!params.indexArray;
        this.data = params.data;
        this.name = params.name;
        this.program = params.program;

        if(!this.indexArray){
            this.location = this.gl.getAttribLocation(this.program, this.name);
            this.type = params.type;

            if(typeof this.location == -1){
                console.error(`[Attribute.js]: attribute ${this.name} is not defined`)
                return -1;
            }
        }


        this.buffer = this.gl.createBuffer();
        this.bindTarget = this.indexArray ? this.gl.ELEMENT_ARRAY_BUFFER : this.gl.ARRAY_BUFFER;
        console.log(this.bindTarget == this.gl.ARRAY_BUFFER);

        this.updateData(this.data);
    }
    updateData(data){
        this.gl.bindBuffer(this.bindTarget, this.buffer);
        this.gl.bufferData(this.bindTarget, this.data, this.gl.STATIC_DRAW);
        console.log(this.data);
        // this.gl.bindBuffer(this.bindTarget, null);
    }
    bind(){
        this.gl.bindBuffer(this.bindTarget, this.buffer);

        if(!this.indexArray){
            console.log(this.itemSize);
            this.gl.vertexAttribPointer(this.location, this.itemSize, this.gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(this.location);
        }
    }

}