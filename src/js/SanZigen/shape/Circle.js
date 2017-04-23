import {Shape} from "./Shape";
import {Vector2} from "../math/Vector2"
import {Vector3} from "../math/Vector3"
import {Color} from "../math/Color";

const glslify = require('glslify');

export class Circle extends Shape {
    constructor(params){
        super({
            renderer: params.renderer,
            vertexShaderSource: glslify("./shaders/Triangle.shader.vert").trim(),
            fragmentShaderSource: glslify("./shaders/Triangle.shader.frag").trim(),
        });

        this.time = 0;
        this.x = params.x ? params.x : 200;
        this.y = params.y ? params.y : 200;
        this.rotation = 0;

        this.pt0 = params.pt0 || new Vector2();
        this.pt1 = params.pt1 || new Vector2();
        this.pt2 = params.pt2 || new Vector2();

        this.ptArray = [this.pt0, this.pt1, this.pt2];

        this.center = this.ptArray.reduce((accumulator, currentValue, currentIndex, array) =>{
            accumulator.x += currentValue.x;
            accumulator.y += currentValue.y;
            return accumulator; }, new Vector2());

        this._color = new Color();
        this.colorVector3 = new Vector3();
        this.color = '#ff0000'|| params.color;

        this._createShape();

        this.resize();
    }

    _createShape(){
        let indices = [
            0, 1, 2
        ];

        let position = [
            this.pt0.x, this.pt0.y,
            this.pt1.x, this.pt1.y,
            this.pt2.x, this.pt2.y,
        ]

        let shapeAttributes = {
            indices: {name: 'indices', indexArray: true, data: new Uint16Array(indices)},
            positions : {name : 'aPosition', itemSize : 2, data: new Float32Array(position)},
        };

        this.count = position.length / 2;

        this.shapeVao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.shapeVao);

        this.initializeAttributes(shapeAttributes);

    }
    updateColor(value){

    }

    updatePts(params = {}){
        if(params.pt0) this.pt0 = params.pt0;
        if(params.pt1) this.pt1 = params.pt1;
        if(params.pt2) this.pt2 = params.pt2;

        this.gl.bindVertexArray(this.shapeVao);
        let pts = this.attributes['positions'].data;
        pts[0] = this.pt0.x; pts[1] = this.pt0.y;
        pts[2] = this.pt1.x; pts[3] = this.pt1.y;
        pts[4] = this.pt2.x; pts[5] = this.pt2.y;

        this.attributes['positions'].updateData(pts);
    }

    _updateUniforms(){
        this.uniforms['uPosition'].set2f(this.x, this.y);
        this.uniforms['uColor'].set3f(this._color.r, this._color.g, this._color.b);
        this.uniforms['uWindow'].set2f(window.innerWidth, window.innerHeight);
        this.uniforms['uRotation'].set1f(this.rotation)
    }

    update(dt = 1/60){
        this.time += dt;

        this.x = window.innerWidth/2; //window.innerWidth/2 + 100 * Math.cos(this.time );
        this.y = window.innerHeight/2; //window.innerHeight/2 + 100 * Math.sin(this.time );

        return this
    }

    draw(){
        let gl = this.renderer.gl;

        gl.useProgram(this.program);
        gl.bindVertexArray(this.shapeVao);

        this._updateUniforms();

        gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);

    }

    resize(){

    }
    set color(value){
        this._colorStr = value;
        this._color.setStyle(this._colorStr);

        this.colorVector3.set(this._color.r, this._color.g, this._color.b);
    }
    get color(){
        return this._colorStr;
    }
}