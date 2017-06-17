'use strict';

import {WebGLRenderer, Vector2, Vector3, Matrix4, ArrowHelper, PerspectiveCamera, SanMath } from 'SanZigen';

const TweenMax = require('gsap');
const Stats = require('stats.js');
const dat = require('dat.gui/build/dat.gui.js');

export default class App {
    constructor(params){
        // this.updateLinePts = this.updateLinePts.bind(this);

        this.renderer = new WebGLRenderer({alpha: true, antialias: true});
        this.domElement = this.renderer.domElement;

        this.isLookAt = true ;

        this._initializeShape(params);
        this._initializeCamera();

        this._addGui();
        this._addStats();


        this.resize();
    }

    _initializeShape(params){
        // this.box = new CustomBox({renderer: this.renderer});

        this.arrowHelpers = [];

        var arrowNum = 18;
        for(let ii = 0; ii < arrowNum; ii++){

            let arrowHelper = new ArrowHelper({
                renderer: this.renderer,
                size : 100,
                direction : new Vector3(Math.cos(2 * Math.PI / arrowNum * ii), Math.sin(2 * Math.PI/arrowNum * ii), 0)
            });

            this.arrowHelpers.push(arrowHelper);
        }

        for(let jj = 0; jj < arrowNum; jj++){
            let arrowHelper = new ArrowHelper({
                renderer: this.renderer,
                size : 100,
                direction : new Vector3(Math.cos(2 * Math.PI / arrowNum * jj), 0, Math.sin(2 * Math.PI/arrowNum * jj)),
                color : '#00ff00'
            });

            this.arrowHelpers.push(arrowHelper);
        }

    }

    _initializeCamera(){
        this.camera = new PerspectiveCamera();
        this.camera.setProjectionMatrix(60, window.innerWidth / window.innerHeight, 1, 10000);
        // this.camera.position.x = 100;
        this.camera.position.z = 500;
        // this.camera.position.y = 400;

        // this.arrowHelper.updateProjectionMatrix(this.camera);
        this.arrowHelpers.forEach(arrowHelper => arrowHelper.updateProjectionMatrix(this.camera));
        this._onChangeCameraPosition();
    }

    _addGui(){
        this.gui = new dat.GUI();
        this.playAndStopGui = this.gui.add(this, '_playAndStop').name('pause');

        /**
        this.arrowFolder = this.gui.addFolder('arrow');
        this.directionFolder = this.arrowFolder.addFolder('direction');
        this.directionFolder.add(this.arrowHelper.direction, 'x', -1, 1).onChange(() =>{
            this.arrowHelper.updateDirection()
        }).step(0.01);
        this.directionFolder.add(this.arrowHelper.direction, 'y', -1, 1).onChange(() =>{
            this.arrowHelper.updateDirection()
        }).step(0.01);
        this.directionFolder.add(this.arrowHelper.direction, 'z', -1, 1).onChange(() =>{
            this.arrowHelper.updateDirection()
        }).step(0.01); */

        this.cameraPositionFolder = this.gui.addFolder('camera');
        this.cameraPositionFolder.add(this.camera.position, 'x', -500, 500).onChange(() => this._onChangeCameraPosition());
        this.cameraPositionFolder.add(this.camera.position, 'y', -500, 500).onChange(() => this._onChangeCameraPosition());
        this.cameraPositionFolder.add(this.camera.position, 'z', 0, 1200).onChange(() => this._onChangeCameraPosition());
        this.cameraPositionFolder.add(this, 'isLookAt').onChange(() => this._onChangeCameraPosition());
    }

    _onChangeCameraPosition(){
        if(this.isLookAt){
            this.camera.lookAt(new Vector3());
        }

        this.camera.updateViewMatrix();
        // this.arrowHelper.updateViewMatrix(this.camera);
        this.arrowHelpers.forEach(arrowHelper => arrowHelper.updateViewMatrix(this.camera));

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


        // this.arrowHelper.draw();
        this.arrowHelpers.forEach(arrowHelper => arrowHelper.draw());

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
