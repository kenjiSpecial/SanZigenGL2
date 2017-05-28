'use strict';

import { WebGLRenderer, Box, Vector2, Vector3, Matrix4 } from 'SanZigen'

const TweenMax = require('gsap');
const Stats = require('stats.js');
const dat = require('dat.gui/build/dat.gui.js');

export default class App {
    constructor(params){
        this.renderer = new WebGLRenderer({alpha: true, antialias: true});
        this.domElement = this.renderer.domElement;


        this._initializeShape(params);
        this._initializeCamera();

        this._addGui();
        this._addStats();


        this.resize();
    }

    _initializeShape(params){
        this.box = new Box({renderer: this.renderer});
        this.box.setProjectionMatrix(60, window.innerWidth / window.innerHeight, 1, 1000);
    }

    _initializeCamera(){
        this.cameraPosition = new Vector3();
        this.cameraPosition.x = 100;

        this.cameraMatrix = new Matrix4();
        this.cameraMatrix.identity();
        this.cameraInverseMatrix = new Matrix4();

        this.isLookAt = true;

        this._onChangeCameraPosition();
    }

    _addGui(){
        this.gui = new dat.GUI();
        this.playAndStopGui = this.gui.add(this, '_playAndStop').name('pause');
        this.positionFolder = this.gui.addFolder('uPosition');
        this.positionFolder.add(this.box.position, 'z', -1000, 100).onChange(()=>{ this.box.updateModelMatrix(); });

        this.rotationFolder = this.gui.addFolder('rotation');
        this.rotationFolder.add(this.box.rotation, 'x', -Math.PI, Math.PI).step(0.01);
        this.rotationFolder.add(this.box.rotation, 'y', -Math.PI, Math.PI).step(0.01);
        this.rotationFolder.open();

        this.cameraPositionFolder = this.gui.addFolder('camera');
        this.cameraPositionFolder.add(this.cameraPosition, 'x', -200, 200).onChange( () => this._onChangeCameraPosition() );
        this.cameraPositionFolder.add(this.cameraPosition, 'y', -200, 200).onChange( () => this._onChangeCameraPosition() );
        this.cameraPositionFolder.add(this.cameraPosition, 'z', -200, 200).onChange( () => this._onChangeCameraPosition() );
        this.cameraPositionFolder.add(this, 'isLookAt').onChange( () => this._onChangeCameraPosition() );

    }
    _onChangeCameraPosition(){
        this.cameraMatrix.makeTranslation(this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z);
        if(this.isLookAt){
            this.cameraMatrix.lookAt(this.cameraPosition, this.box.position, new Vector3(0, 1, 0))
        }
        this.cameraInverseMatrix.getInverse(this.cameraMatrix);

        this.box.updateViewMatrix(this.cameraInverseMatrix);
    }
    _onUpdateRad(){
        this.circle.updateRadius();
    }
    _updateShape(){
        this.triangle.updatePts();
    }

    _addStats(){
        this.stats = new Stats();
        document.body.appendChild( this.stats.dom );
    }

    animateIn(){
        this.isLoop = true;
        TweenMax.ticker.addEventListener('tick', this.loop, this);
    }

    loop(){
        let gl = this.renderer.gl;

        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);


        this.box.update().draw();

        this.stats.update();
    }

    animateOut(){
        TweenMax.ticker.removeEventListener('tick', this.loop, this);
    }

    onMouseMove(mouse){

    }
    onKeyDown(ev){
        switch(ev.which){
            case 27:
                this._playAndStop();
                break;
        }
    }

    _playAndStop(){
        this.isLoop = !this.isLoop;
        if(this.isLoop){
            TweenMax.ticker.addEventListener('tick', this.loop, this);
            this.playAndStopGui.name('pause');
        }else{
            TweenMax.ticker.removeEventListener('tick', this.loop, this);
            this.playAndStopGui.name('play');
        }
    }
    resize(){
        this.renderer.setSize( window.innerWidth, window.innerHeight);
    }

    destroy(){

    }

}
