'use strict';

import { WebGLRenderer, Triangle, Vector2 } from 'SanZigen'

const TweenMax = require('gsap');
const Stats = require('stats.js');
const dat = require('dat.gui/build/dat.gui.js');

export default class App {
    constructor(params){
        this.renderer = new WebGLRenderer();
        this.domElement = this.renderer.domElement;


        this._initializeShape(params);


        this._addGui();
        this._addStats();


        this.resize();
    }

    _initializeShape(params){
        this.triangle = new Triangle({
            renderer: this.renderer,
            pt0: new Vector2(-100, 0),
            pt1: new Vector2(0, 200),
            pt2: new Vector2(100, 0)
        });
    }

    _addGui(){
        this.gui = new dat.GUI();

        this.positionFolder = this.gui.addFolder("coordinates");
        this.positionFolder.add(this.triangle.pt0, 'x', -200, 200).name("pt0.x").onChange(this._updateShape.bind(this));
        this.positionFolder.add(this.triangle.pt0, 'y', -200, 200).name("pt0.y").onChange(this._updateShape.bind(this));
        this.positionFolder.add(this.triangle.pt1, 'x', -200, 200).name("pt1.x").onChange(this._updateShape.bind(this));
        this.positionFolder.add(this.triangle.pt1, 'y', -200, 200).name("pt1.y").onChange(this._updateShape.bind(this));
        this.positionFolder.add(this.triangle.pt2, 'x', -200, 200).name("pt2.x").onChange(this._updateShape.bind(this));
        this.positionFolder.add(this.triangle.pt2, 'y', -200, 200).name("pt2.y").onChange(this._updateShape.bind(this));

        this.gui.add(this.triangle, 'rotation', -Math.PI, +Math.PI).step(0.01);
        this.playAndStopGui = this.gui.add(this, '_playAndStop').name('pause');
        this.colorGui = this.gui.addColor(this.triangle, 'color').name('color').onChange(this._updateColor.bind(this));

    }
    _updateShape(){
        this.triangle.updatePts();
    }
    _updateColor(){
        this.triangle.updateColor();
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

        this.triangle.update().draw();

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
