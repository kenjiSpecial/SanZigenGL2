'use strict';

import { WebGLRenderer, Circle, Triangle, Vector2 } from 'SanZigen'

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
        this.circles = [];
        for(let ii = 0; ii < 10; ii++){
            let circle = new Circle({ renderer : this.renderer, x: window.innerWidth * Math.random(), y: window.innerHeight * Math.random(), rad : 20 + 280 * Math.random()});
            this.circles.push(circle);
        }
        this.circle = new Circle({ renderer : this.renderer, x: window.innerWidth * Math.random(), y: window.innerHeight * Math.random(), rad : 20 + 280 * Math.random()});
    }

    _addGui(){
        this.gui = new dat.GUI();
        this.playAndStopGui = this.gui.add(this, '_playAndStop').name('pause')

        this.radGui = this.gui.add(this.circle, 'rad', 10, 200).onChange(this._onUpdateRad.bind(this));
        this.colorGui = this.gui.addColor(this.circle, 'color').name('color'); //.onChange(this._updateColor.bind(this));
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

        this.circles.forEach(circle => circle.update().draw());
        this.circle.update().draw();

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
