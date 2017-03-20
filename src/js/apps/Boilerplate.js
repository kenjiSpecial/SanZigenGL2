'use strict';
import {WebGLRenderer} from '../SanJigen/SanJigen'


export default class App {
    constructor(params){
        this.renderer = new WebGLRenderer();

        this.resize();
    }
    
    _addGui(){
        this.gui = new dat.GUI();
    }

    animateIn(){
        TweenMax.ticker.addEventListener('tick', this.loop, this);
    }

    loop(){

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
                    TweenMax.ticker.addEventListener('tick', this.loop, this);
                }else{
                    TweenMax.ticker.removeEventListener('tick', this.loop, this);
                }
                break;
        }
    }

    resize(){

    }

    destroy(){

    }

}
