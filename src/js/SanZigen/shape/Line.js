"use strict";
import {Uniform, Attribute} from '../index';
import {PerspectiveCamera} from '../index';
import {Vector2, Vector3, Color, Euler, Quaternion, Matrix4} from '../index';
const EventEmitter = require('eventemitter3');
const glslify = require('glslify');

export class Line extends EventEmitter {
    constructor(params){
        super();
        params = params || {};
        params.vertexShaderSource = glslify("./shaders/Line.shader.vert").trim();
        params.fragmentShaderSource = glslify("./shaders/Line.shader.frag").trim();


        this.uniforms = {};
        this.attributes = {};
        this.params = params;

        this._onChangeRotation = this._onChangeRotation.bind(this);

        try{
            this.renderer = params.renderer;
            if(this.renderer === undefined) throw 'renderer is undefined.';
        }catch(e){
            console.error(e);
        }

        this.position = new Vector3(0, 0, 0);
        this.scale = new Vector3(1, 1, 1);

        this.rotation = new Euler();
        this.rotationQuaternion = new Quaternion();
        this.rotationMat = new Matrix4();
        this.rotation.onChange(this._onChangeRotation);

        this._color = new Color();
        this.colorVector3 = new Vector3();
        this.color = params.color ?  params.color : '#ff0000' ;

        this.modelMatrix = new Matrix4();
        this.updateModelMatrix();

        this.pts = this.params.pts ? this.params.pts : [];
        this.gl = this.renderer.gl;
        this.program = this.renderer.createProgram(params.vertexShaderSource, params.fragmentShaderSource);

        this._initializeUniforms();

        this._createShape();
    }

    _onChangeRotation(){
        this.rotationQuaternion.setFromEuler(this.rotation);
        this.updateModelMatrix();
    }

    updateModelMatrix(){
        this.modelMatrix.compose(this.position, this.rotationQuaternion, this.scale);
        this.modelMatrixArray = new Float32Array(this.modelMatrix.toArray());
    }

    _initializeUniforms(){
        let numUniforms = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_UNIFORMS);

        for(let ii = 0; ii < numUniforms; ii++){
            let uniformInfo = this.gl.getActiveUniform(this.program, ii);
            let uniformLocation = this.gl.getUniformLocation(this.program, uniformInfo.name);
            this.uniforms[uniformInfo.name] = new Uniform({
                uniformInfo: uniformInfo,
                uniformLocation: uniformLocation,
                gl: this.gl
            });
        }
    }

    _createShape(){
        this.vertices = new Float32Array(this.pts.length * 3);

        for(let ii = 0; ii < this.pts.length; ii++){

            this.vertices[3 * ii + 0] = this.pts[ii].x;
            this.vertices[3 * ii + 1] = this.pts[ii].y;
            this.vertices[3 * ii + 2] = this.pts[ii].z;

        }


        let shapeAttribute = {
            positions: {name: 'aPosition', itemSize: 3, data: this.vertices}
        };

        this.lineVao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.lineVao);

        this.initializeAttributes(shapeAttribute);
    }

    initializeAttributes(attributes){
        for(let key in attributes){
            this.attributes[key] = new Attribute({
                gl: this.gl,
                program: this.program,
                itemSize: attributes[key].itemSize,
                data: attributes[key].data,
                name: attributes[key].name,
                indexArray: attributes[key].indexArray
            })
            this.attributes[key].bind();
        }
    }

    updatePts(pts = []){
        this.pts = pts;
        this.vertices = new Float32Array(this.pts.length * 3);

        for(let ii = 0; ii < this.pts.length; ii++){
            this.vertices[3 * ii + 0] = this.pts[ii].x;
            this.vertices[3 * ii + 1] = this.pts[ii].y;
            this.vertices[3 * ii + 2] = this.pts[ii].z;
        }

        this.gl.bindVertexArray(this.lineVao);
        this.attributes['positions'].updateData(this.vertices);
    }

    updateViewMatrix(value){
        if( value instanceof Matrix4 ){
            this.viewMatrixArray = new Float32Array(value.toArray());
        }else if(value instanceof  PerspectiveCamera){
            this.viewMatrixArray = new Float32Array(value.toViewArray());
        }else{
            console.warn('[Box:updateViewMatrix] value you pass is not matched, you need to pass class of Matrix4 or Camera', value);
        }
    }

    updateProjectionMatrix(value){
        if(value instanceof Matrix4){
            this.projectionMatrixArray = new Float32Array(value.toArray());
        }else if(value instanceof PerspectiveCamera){
            this.projectionMatrixArray = new Float32Array(value.toProjectionArray());
        }else{
            console.warn('[Box:updateProjectMatrix] value you pass is not matched, you need to pass class of Matrix4 or Camera', value);
        }
    }
    _updateUniforms(){
        // console.log(this.uniforms);
        this.uniforms['uColor'].set3f(this._color.r, this._color.g, this._color.b);
        this.uniforms['projectionMatrix'].setMatrix4(this.projectionMatrixArray);
        this.uniforms['modelMatrix'].setMatrix4(this.modelMatrixArray);
        this.uniforms['viewMatrix'].setMatrix4(this.viewMatrixArray);
    }

    draw(){
        let gl = this.renderer.gl;

        gl.useProgram(this.program);
        gl.bindVertexArray(this.lineVao)

        this._updateUniforms()

        gl.drawArrays(gl.LINES, 0, this.pts.length );
    }


    set color(value){
        this._colorStr = value;
        this._color.setStyle(this._colorStr);
    }

    get color(){
        return this._colorStr;
    }

}