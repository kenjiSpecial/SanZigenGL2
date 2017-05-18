import {Shape} from "./Shape";
import {Vector2} from "../math/Vector2"
import {Vector3} from "../math/Vector3"
import {Color} from "../math/Color";
import {Euler} from '../math/Euler';
import {Quaternion} from '../math/Quaternion';
import {PerspectiveCamera} from '../camera/PerspectiveCamera';
import {Matrix4} from '../math/Matrix4';

const glslify = require('glslify');

export class Box extends Shape {
    constructor(params){
        super({
            renderer: params.renderer,
            vertexShaderSource: glslify("./shaders/Box.shader.vert").trim(),
            fragmentShaderSource: glslify("./shaders/Box.shader.frag").trim(),
        });

        this._onChangeRotation = this._onChangeRotation.bind(this);

        this.time = 0;
        this.width = 100;
        this.height = 100;
        this.depth = 100;

        let x = params.x ? params.x : 0;
        let y = params.y ? params.y : 0;
        let z = params.z ? params.z : -500;

        this.position = params.position ? params.position : new Vector3(x, y, z);
        this.scale = params.scale ? params.scale : new Vector3(1, 1, 1);


        this.verticeNum = params.verticeNum || 100;
        this.vertices = new Float32Array((this.verticeNum + 1) * 2);
        this.vertices[0] = 0;
        this.vertices[1] = 0;

        this.rad = params.rad || 1;

        this._color = new Color();
        this.colorVector3 = new Vector3();
        this.color = '#ff0000' || params.color;

        this.indiceLength = this._createShape();

        this.rotation = new Euler();
        this.rotationQuaternion = new Quaternion();
        this.rotationMat = new Matrix4();
        this.rotation.onChange(this._onChangeRotation);


        this.modelMatrix = new Matrix4();
        this.updateModelMatrix();


        this.projectionMatrix = new Matrix4();
        this.projectionMatrixArray = new Float32Array(this.projectionMatrix.toArray());

        this.viewMatrix = new Matrix4();
        this.viewMatrix.identity();
        this.viewMatrixArray = new Float32Array(this.viewMatrix.toArray());

        this.resize();
    }

    _onChangeRotation(){
        this.rotationQuaternion.setFromEuler(this.rotation);
        this.updateModelMatrix();
    }

    updateModelMatrix(){
        this.modelMatrix.compose(this.position, this.rotationQuaternion, this.scale);
        this.modelMatrixArray = new Float32Array(this.modelMatrix.toArray());
    }

    updateViewMatrix(value){
        if( value instanceof Matrix4 || value instanceof PerspectiveCamera ){
            this.viewMatrixArray = new Float32Array(value.toArray());
        }else{
            console.warn('[Box:updateViewMatrix]value you pass is not matched, you need to pass class of Matrix4 or Camera', value);
        }
    }


    // https://github.com/mrdoob/three.js/blob/master/src/cameras/PerspectiveCamera.js
    setProjectionMatrix(fov, aspect, near, far){
        this.near = near;
        this.far = far;
        this.fov = fov;
        this.aspect = aspect;

        let top = this.near * Math.tan(0.5 * this.fov / 180 * Math.PI);
        let height = 2 * top;
        let width = this.aspect * height;
        let left = -0.5 * width;

        this.projectionMatrix.makeFrustum(
            left, left + width, top - height, top, near, far
        );
        this.projectionMatrixArray = new Float32Array(this.projectionMatrix.toArray());
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
            positions: {name: 'aPosition', itemSize: 3, data: this.vertices},
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
        this.uniforms['uColor'].set3f(this._color.r, this._color.g, this._color.b);
        this.uniforms['projectionMatrix'].setMatrix4(this.projectionMatrixArray);
        this.uniforms['modelMatrix'].setMatrix4(this.modelMatrixArray);
        this.uniforms['viewMatrix'].setMatrix4(this.viewMatrixArray);
    }

    update(dt = 1 / 60){
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