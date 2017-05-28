'use strict';

import { WebGLRenderer, Circle, Triangle, Vector2, Texture, TextureRectangle, appProperties } from 'SanZigen'

const TweenMax = require('gsap');
const Stats = require('stats.js');
const dat = require('dat.gui/build/dat.gui.js');

export default class App {
    constructor(params){
        this.renderer = new WebGLRenderer({alpha: true, antialias: true});
        this.domElement = this.renderer.domElement;

        this._addGui();
        this._addStats();

        this.resize();
    }

    _initializeShape(){
        this.texture = new Texture({
            renderer : this.renderer,
            image : this.sampleImage,
        });
        this.rectangle = new TextureRectangle({renderer: this.renderer, texture : this.texture });
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
        this._startLoad();
        this.isLoop = true;
        TweenMax.ticker.addEventListener('tick', this.loop, this);
    }

    _startLoad(){
        this.sampleImage = new Image();
        this.sampleImage.onload = () => this._onLoadImg();
        this.sampleImage.src = './img/uv_map.jpg';


        setTimeout(()=>{
            this.sampleImage2 = new Image();
            this.sampleImage2.onload = () => this._onLoadImg2();
            this.sampleImage2.src = './img/sample1.jpg';
        }, 1000);

        /**
        setTimeout(()=>{
            this.sampleVideo = document.createElement('video');
            // let source = document.createElement('source');
            let path = './videos/sample.mp4';
            // source.type = "video/mp4";
            // source.src = path;
            this.sampleVideo.src = path;
            this.sampleVideo.crossOrigin = "*";
            // this.sampleVideo.appendChild(source);
            this.sampleVideo.addEventListener('loadeddata', ()=>this._onSampleVideoLoaded());
            this.sampleVideo.load();
        }, 2000);
         */
    }

    _onSampleVideoLoaded(){
        // console.log(this.sampleVideo);
        this.sampleVideo.volume = 0;
        this.videoTexture = new Texture({
            renderer : this.renderer,
            video : this.sampleVideo,
            autoPlay : true
        });

        this.rectangle3 = new TextureRectangle({ renderer: this.renderer, texture : this.videoTexture })
        this.rectangle3.x = 500;

    }

    _onLoadImg(){
        this._initializeShape();
    }

    _onLoadImg2(){
        this.texture2 = new Texture({
            renderer : this.renderer,
            image : this.sampleImage2,
        });
        this.rectangle2 = new TextureRectangle({width : this.sampleImage2.width/2, height: this.sampleImage2.height/2, renderer: this.renderer, texture : this.texture2 });
        this.rectangle2.x = 500;
        this.rectangle2.y = 500;
   }

    loop(){
        let gl = this.renderer.gl;

        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        if(this.rectangle)  this.rectangle.update().draw();
        if(this.rectangle2) this.rectangle2.update().draw();
        if(this.rectangle3) this.rectangle3.update().draw();


        this._afterRendering();
        this.stats.update();
    }

    _afterRendering(){
        appProperties.textureNeedsUpdate = true;
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
