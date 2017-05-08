import {Shape} from "./Shape";
import {Vector2} from "../math/Vector2"
import {Vector3} from "../math/Vector3"
import {Color} from "../math/Color";

const glslify = require('glslify');

export class Circle extends Shape {
    constructor(params){
        super({
            renderer: params.renderer,
            vertexShaderSource: glslify("./shaders/Circle.shader.vert").trim(),
            fragmentShaderSource: glslify("./shaders/Circle.shader.frag").trim(),
        });

        this.time = 0;
        this.x = params.x ? params.x : 200;
        this.y = params.y ? params.y : 200;
        this.rotation = 0;

        this.verticeNum = params.verticeNum || 100;
        this.vertices = new Float32Array( (this.verticeNum + 1) * 2 );
        this.vertices[0] = 0; this.vertices[1] = 0;

        this.rad = params.rad || 100;

        this._color = new Color();
        this.colorVector3 = new Vector3();
        this.color = params.color || '#ff0000';

        this.indiceLength = this._createShape();

        this.resize();
    }

    _createShape(){

        let indices = [];
        for(let ii = 0; ii < this.verticeNum; ii++){
            let curNum = ii % this.verticeNum;
            let nextNum = (ii + 1) % this.verticeNum;

            indices.push(0)
            indices.push(curNum + 1);
            indices.push(nextNum + 1);
        };


        let shapeAttributes = {
            positions : {name : 'aPosition', itemSize : 2, data: this.vertices},
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
        this.uniforms['uPosition'].set2f(this.x, this.y);
        this.uniforms['uWindow'].set2f(window.innerWidth, window.innerHeight);
        this.uniforms['uColor'].set3f(this._color.r, this._color.g, this._color.b);
    }

    update(dt = 1/60){
        this.time += dt;

        // this.x = window.innerWidth/2; //window.innerWidth/2 + 100 * Math.cos(this.time );
        // this.y = window.innerHeight/2; //window.innerHeight/2 + 100 * Math.sin(this.time );

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
    get color(){
        return this._colorStr;
    }
    set rad(value){
        this._rad = value;
        for(let ii = 0; ii < this.verticeNum; ii++){
            this.vertices[(ii + 1) * 2 + 0] = (this.rad * Math.cos(ii / this.verticeNum * 2 * Math.PI));
            this.vertices[(ii + 1)* 2 + 1] = (this.rad * Math.sin(ii / this.verticeNum * 2 * Math.PI))
        }
    }
    get rad(){
        return this._rad;
    }

}