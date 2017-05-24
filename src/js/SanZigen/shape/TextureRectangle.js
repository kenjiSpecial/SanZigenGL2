import {Rectangle} from '../index';

const glslify = require('glslify');

export class TextureRectangle extends Rectangle {
    constructor(params){
        params.vertexShaderSource = glslify("./shaders/TextureTriangle.shader.vert").trim();
        params.fragmentShaderSource = glslify("./shaders/TextureTriangle.shader.frag").trim();
        super(params);

        this.texture = params.texture;
    }
    _createShape(){

        this.vertices = new Float32Array(2 * 2 * 2);
        this.uvs = new Float32Array(2 * 2 * 2);

        for(let xx = 0; xx < 2; xx++){
            let xPos = (xx - 1) * this.width + this.width/2;
            for(let yy = 0; yy < 2; yy++){
                let yPos = (yy - 1) * this.height + this.height/2;
                this.vertices[ (xx * 2 + yy) * 2 ] = xPos;
                this.vertices[ (xx * 2 + yy) * 2 + 1] = yPos;

                this.uvs[(xx * 2 + yy) * 2] = xx;
                this.uvs[(xx * 2 + yy) * 2 + 1] = yy;
            }
        }

        let indices = [0, 2, 1, 3, 2, 1];


        console.log(this.uvs);

        let shapeAttributes = {
            positions : {name : 'aPosition', itemSize : 2, data: this.vertices},
            uvs : {name: 'aUv', itemSize: 2, data : this.uvs},
            indices: {name:  'indices', indexArray: true, data: new Uint16Array(indices)},
        };

        this.shapeVao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.shapeVao);

        this.initializeAttributes(shapeAttributes);

        return indices.length;
    }
    _updateUniforms(){
        this.uniforms['uPosition'].set2f(this.x, this.y);
        this.uniforms['uWindow'].set2f(window.innerWidth, window.innerHeight);
        this.uniforms['uSampler'].setTexture(this.texture);
    }
}