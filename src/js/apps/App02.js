'use strict';

import { webGLShader, WebGLRenderer } from '../SanJigen/SanJigen/'
const TweenMax = require('gsap');

const THREE = require('three');
const vertexShaderSource = `#version 300 es

in vec4 aPosition;

void main(){
    gl_Position = aPosition;
}
`;

const fragmentShaderSource = `#version 300 es
precision mediump float;

uniform UBOData {
    float Red;
    float Green;
    float Blue;
} UBOA;

uniform UBTest {
    float x0;
    float y0;
} UBT;

uniform float uColor;

out vec4 outColor;

void main() {
  // Just set the output to a constant redish-purple
  outColor = vec4(uColor * UBOA.Red * UBT.x0,  UBOA.Green, UBOA.Blue, 1.0);
}
`

var buffer= new ArrayBuffer(16);
var z = new Float32Array(buffer, 0, 4);
// console.log(z);



export default class App {
    constructor(params){
        this.renderer = new WebGLRenderer({alpha : true});
        this.program = this.renderer.createProgram(vertexShaderSource, fragmentShaderSource);

        this._addAttributes();
        this._addShape0();
        this._makeUniformBuffer();
        // this._addShape1();

        this.domElement = this.renderer.domElement;
    }
    _addAttributes(){

        let gl = this.renderer.gl;
        console.log(gl.getParameter(gl.UNIFORM_BUFFER_OFFSET_ALIGNMENT));
        console.log(Math.log2(gl.getParameter(gl.UNIFORM_BUFFER_OFFSET_ALIGNMENT)));

        let program = this.program;
        gl.bindAttribLocation( program, 0, "aPosition" );
        let positionAttributeLocation = gl.getAttribLocation(program, "aPosition");

        let positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        let positions = [
            0, 0,
            0, 0.2,
            0.7, 0,
            0.5, 0.5,
            0.0, 0.0,
            0.7, 0,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        this.positionAttributeLocation = positionAttributeLocation;


    }

    _addShape0(){
        let gl = this.renderer.gl;

        this.shape0Vao = gl.createVertexArray();
        gl.bindVertexArray(this.shape0Vao);
        gl.enableVertexAttribArray(this.positionAttributeLocation);
        gl.vertexAttribPointer(this.positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

        let indices = [
            0, 1, 2,
            0, 2, 3
        ]

        let indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        this.indicesBuffer = indexBuffer;

        let numUniforms = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES);

    }

    _makeUniformBuffer(){
        let gl = this.renderer.gl;
        let numUniforms = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES);
        // console.log(numUniforms);
        console.log(gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORM_BLOCKS));

        // let uCOlorPosition = gl.getUniformLocation(this.program, 'uColor');
        // let blockIndex = gl.getUniformLocation(this.program, 'UBOA');
        //
        // console.log(blockIndex);
        // let blockSize = gl.getActiveUniformBlockParameter(this.program, blockIndex);

        let blockIndex = gl.getUniformBlockIndex(this.program, 'UBOData');
        let blockSize = gl.getActiveUniformBlockParameter(this.program, blockIndex, gl.UNIFORM_BLOCK_DATA_SIZE);
        let uniformIndices = gl.getUniformIndices(this.program, ["UBOData.Red", "UBOData.Green", "UBOData.Blue"]);
        let uniformOffsets = gl.getActiveUniforms(this.program, uniformIndices, gl.UNIFORM_OFFSET);

        // console.log(blockSize);
        // console.log(blockSize/4);


        var offsetAlignment = gl.getParameter(gl.UNIFORM_BUFFER_OFFSET_ALIGNMENT);
        var offset = Math.ceil(blockSize / offsetAlignment) * offsetAlignment;

        let uboArray = new ArrayBuffer(8 + offset);
        let uboFloatView = new Float32Array(uboArray);
        uboFloatView[uniformOffsets[0] / Float32Array.BYTES_PER_ELEMENT] = 1.0;
        uboFloatView[uniformOffsets[1] / Float32Array.BYTES_PER_ELEMENT] = 1.0;
        uboFloatView[uniformOffsets[2] / Float32Array.BYTES_PER_ELEMENT] = 1.0;
        uboFloatView[offset/ Float32Array.BYTES_PER_ELEMENT + 0] = 1.0;
        uboFloatView[offset/ Float32Array.BYTES_PER_ELEMENT + 1] = 1.0;

        this.uboFloatView = uboFloatView;
        // UBTest
        let ubTestBlockIndex = gl.getUniformBlockIndex(this.program, 'UBTest');
        let ubTestBlockSize = gl.getActiveUniformBlockParameter(this.program, ubTestBlockIndex, gl.UNIFORM_BLOCK_DATA_SIZE);
        let ubTestUniformIndices = gl.getUniformIndices(this.program, ["UBTest.x0", "UBTest.y0" ]);

        let b1 = gl.createBuffer();
        gl.bindBuffer(gl.UNIFORM_BUFFER, b1);
        gl.bufferData(gl.UNIFORM_BUFFER, uboArray, gl.DYNAMIC_DRAW);

        let bindings = [1, 2];
        gl.uniformBlockBinding(this.program, blockIndex, bindings[0]);
        gl.bindBufferRange(gl.UNIFORM_BUFFER, bindings[0], b1, 0, blockSize);

        gl.uniformBlockBinding(this.program, gl.getUniformBlockIndex(this.program, 'UBTest'), bindings[1]);
        gl.bindBufferRange(gl.UNIFORM_BUFFER, bindings[1], b1, offset, 8);

    }

    _addGui(){
        this.gui = new dat.GUI();
    }

    animateIn(){
        TweenMax.ticker.addEventListener('tick', this.loop, this);
    }

    loop(){
        if(!this.time) this.time = 0;
        this.time += 1/60;

        let gl = this.renderer.gl;

        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);


        gl.useProgram(this.program);

        gl.bindVertexArray(this.shape0Vao);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);

        if( parseInt(this.time * 10) % 2 == 0){
            let uCOlorPosition = gl.getUniformLocation(this.program, 'uColor');
            gl.uniform1f(uCOlorPosition, (Math.cos(this.time) + 1)/2) ;
        }

        this.uboFloatView[0] = (Math.cos(this.time) + 1)/2;
        gl.bufferData(gl.UNIFORM_BUFFER, this.uboFloatView, gl.DYNAMIC_DRAW);



        gl.drawArrays( gl.TRIANGLE_FAN, 0, 4);

        if(this.stats) this.stats.update();
    }

    animateOut(){
        TweenMax.ticker.removeEventListener('tick', this.loop, this);
    }

    onMouseMove(mouse){

    }

    onKeyDown(ev){
        switch(ev.which){
            case 27:
                this.isLoop = !this.isLoop;
                if(this.isLoop){
                    this.clock.stop();
                    TweenMax.ticker.addEventListener('tick', this.loop, this);
                }else{
                    this.clock.start();
                    TweenMax.ticker.removeEventListener('tick', this.loop, this);
                }
                break;
        }
    }

    resize(){
        this.renderer.setSize( window.innerWidth, window.innerHeight);
    }

    destroy(){

    }

}
