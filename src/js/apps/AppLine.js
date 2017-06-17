'use strict';

import {WebGLRenderer, Vector2, Vector3, Matrix4, Line, PerspectiveCamera, SanMath } from 'SanZigen';

const TweenMax = require('gsap');
const Stats = require('stats.js');
const dat = require('dat.gui/build/dat.gui.js');

export default class App {
    constructor(params){
        this.updateLinePts = this.updateLinePts.bind(this);

        this.renderer = new WebGLRenderer({alpha: true, antialias: true});
        this.domElement = this.renderer.domElement;

        this.isLookAt = false;

        this._initializeShape(params);
        this._initializeCamera();

        this._addGui();
        this._addStats();


        this.resize();
    }

    _initializeShape(params){
        // this.box = new CustomBox({renderer: this.renderer});
        this.line = new Line({
            renderer : this.renderer,
            pts : [new Vector3(0, 0, 0), new Vector3(150, 150, 0)]
        })
    }

    _initializeCamera(){
        this.camera = new PerspectiveCamera();
        this.camera.setProjectionMatrix(60, window.innerWidth / window.innerHeight, 1, 10000);
        // this.camera.position.x = 100;
        this.camera.position.z = 500;

        this.line.updateProjectionMatrix(this.camera);

        this._onChangeCameraPosition();
    }

    _addGui(){
        this.gui = new dat.GUI();
        this.playAndStopGui = this.gui.add(this, '_playAndStop').name('pause');

        this.lineFolder = this.gui.addFolder('line');
        this.lineFolder.add(this, 'updateLinePts');

        this.cameraPositionFolder = this.gui.addFolder('camera');
        this.cameraPositionFolder.add(this.camera.position, 'x', -500, 500).onChange(() => this._onChangeCameraPosition());
        this.cameraPositionFolder.add(this.camera.position, 'y', -500, 500).onChange(() => this._onChangeCameraPosition());
        this.cameraPositionFolder.add(this.camera.position, 'z', 0, 1200).onChange(() => this._onChangeCameraPosition());
        this.cameraPositionFolder.add(this, 'isLookAt').onChange(() => this._onChangeCameraPosition());
    }

    updateLinePts(){
        let pt0 = new Vector3(
            SanMath.randFloat(-100, 100),
            SanMath.randFloat(-100, 100),
            SanMath.randFloat(-100, 100),
        );
        let pt1 = new Vector3(
            SanMath.randFloat(-100, 100),
            SanMath.randFloat(-100, 100),
            SanMath.randFloat(-100, 100),
        );

        console.log(pt0);
        cl
    }

    _onChangeCameraPosition(){
        if(this.isLookAt){
            this.camera.lookAt(this.box.position);
        }

        this.camera.updateViewMatrix();
        this.line.updateViewMatrix(this.camera);
    }

    _addStats(){
        this.stats = new Stats();
        document.body.appendChild(this.stats.dom);
    }

    animateIn(){
        this.isLoop = true;
        TweenMax.ticker.addEventListener('tick', this.loop, this);
    }

    loop(){
        let gl = this.renderer.gl;

        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);


        this.line.draw();

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
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    destroy(){

    }

}
