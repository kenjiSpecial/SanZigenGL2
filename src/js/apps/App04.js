'use strict';

import { WebGLRenderer } from 'SanZigen'

import CustomShape from './Shapes/CustomShape';
import CustomShape2 from './Shapes/CustomShape2'

const TweenMax = require('gsap');
const THREE = require('three');

export default class App {
    constructor(params){

        this.renderer = new WebGLRenderer({alpha : true});
        this.shape = new CustomShape({
            renderer : this.renderer,
        });
        this.shape2 = new CustomShape2({
            renderer : this.renderer,
        });

        this.domElement = this.renderer.domElement;
    }

    _addGui(){
        this.gui = new dat.GUI();
    }

    animateIn(){
        TweenMax.ticker.addEventListener('tick', this.loop, this);
    }
    _updateShape(){

    }
    loop(){
        if(!this.time) this.time = 0;
        this.time += 1/60;

        let gl = this.renderer.gl;

        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        this.shape
                .update()
                .draw();
        this.shape2
                .update()
                .draw();

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
