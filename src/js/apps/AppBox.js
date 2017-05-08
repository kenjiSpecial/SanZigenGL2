'use strict';

import { WebGLRenderer, Box, Vector2 } from 'SanZigen'

const TweenMax = require('gsap');
const Stats = require('stats.js');
const dat = require('dat.gui/build/dat.gui.js');

export default class App {
    constructor(params){
        this.renderer = new WebGLRenderer({alpha: true, antialias: true});
        this.domElement = this.renderer.domElement;


        this._initializeShape(params);


        this._addGui();
        this._addStats();


        this.resize();
    }

    _initializeShape(params){
        this.box = new Box({renderer: this.renderer});
    }

    _addGui(){
        this.gui = new dat.GUI();
        this.playAndStopGui = this.gui.add(this, '_playAndStop').name('pause')

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
