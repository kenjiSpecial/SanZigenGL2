import {Shape} from "./Shape";
import {Vector2} from "../math/Vector2"
import {Vector3} from "../math/Vector3"
import {Color} from "../math/Color";

const glslify = require('glslify');

export class Box extends Shape {
    constructor(params){
        super({
            renderer: params.renderer,
            vertexShaderSource: glslify("./shaders/Box.shader.vert").trim(),
            fragmentShaderSource: glslify("./shaders/Box.shader.frag").trim(),
        });

        this.time = 0;
        this.width = 100;
        this.height = 100;
        this.depth = 100;

        this.x = params.x ? params.x : 200;
        this.y = params.y ? params.y : 200;
        this.z = params.z ? params.z : 200;

        this.rotation = 0;

        this.verticeNum = params.verticeNum || 100;
        this.vertices = new Float32Array( (this.verticeNum + 1) * 2 );
        this.vertices[0] = 0; this.vertices[1] = 0;

        this.rad = params.rad || 100;

        this._color = new Color();
        this.colorVector3 = new Vector3();
        this.color = '#ff0000'|| params.color;

        this.indiceLength = this._createShape();

        this.resize();
    }

    _createShape(){

        // xyz 3 pt

        this.vertices = new Float32Array(2 * 2 * 2 * 3);

        for(let zz = 0; zz < 2; zz++){
            let zPos = (zz - 1) * this.depth + this.depth / 2;
            for(let xx = 0; xx < 2; xx++){
                let xPos = (xx - 1) * this.width + this.width / 2;
                for(let yy = 0; yy < 2; yy++){
                    let yPos = (yy - 1) * this.height + this.height / 2;
                    let num = (zz * 2 * 2 + xx * 2 + yy)
                    this.vertices[3 * num] = xPos;
                    this.vertices[3 * num + 1] = yPos;
                    this.vertices[3 * num + 2] = zPos;
                }
            }
        }

        let indices = [0, 2, 1, // front left
                       3, 1, 2, // front right
                       1, 3, 5, // top left
                       7, 5, 3, // top right
                       2, 6, 3, // rightSide left
                       7, 3, 6, // rightSide right
                       0, 4, 1, // leftSide left
                       5, 1, 4, // leftSide right
                       0, 4, 2, // bottom left
                       6, 4, 2, // bottom right
                       4, 6, 5, // back left
                       7, 5, 6  // back right
        ];


        let shapeAttributes = {
            positions : {name : 'aPosition', itemSize : 3, data: this.vertices},
            indices: {name: 'indices', indexArray: true, data: new Uint16Array(indices)},
        };

        this.shapeVao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.shapeVao);

        this.initializeAttributes(shapeAttributes);

        return indices.length;
    }

    updateRadius(value){
        if(value) this.rad = value;

        this.gl.bindVertexArray(this.shapeVao);
        this.attributes['positions'].updateData(this.vertices);

    }


    _updateUniforms(){
        this.uniforms['uPosition'].set3f(this.x, this.y, this.z);
        this.uniforms['uWindow'].set2f(window.innerWidth, window.innerHeight);
        this.uniforms['uColor'].set3f(this._color.r, this._color.g, this._color.b);
    }

    update(dt = 1/60){
        this.time += dt;



        return this
    }

    draw(){
        let gl = this.renderer.gl;

        gl.useProgram(this.program);
        gl.bindVertexArray(this.shapeVao);

        this._updateUniforms();

        gl.drawElements(gl.TRIANGLES, this.indiceLength, gl.UNSIGNED_SHORT, 0);
    }

    resize(){

    }
    set color(value){
        this._colorStr = value;
        this._color.setStyle(this._colorStr);
    }

}