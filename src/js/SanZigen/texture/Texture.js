"use strict";
const EventEmitter = require('eventemitter3');
import {appProperties} from '../index';

export class Texture {
    constructor(params){

        this.id = appProperties.textureNumber++;
        this.renderer = params.renderer;

        this.gl = this.renderer.gl;
        this.texture = this.gl.createTexture();
        this.textureUnit = this.gl['TEXTURE' + this.id];

        if(params.image){
            this.image = params.image;
            this.bind();
            this.updateImage();
            this.setParameters();
        }else if(params.imgUrl){
            this.image = new Image();
            this.image.onload = () => this._onLoadImg();
            this.image.src = params.imgUrl;
            this.isLoaded = false;
        }else if(params.video){
            this.video = params.video;
            this.video.loop = true;
            // console.log(this.video);
            // this.video.addEventListener('playing', ()=>{
                // console.log('???');
                this.bind();
                this.setCustomParameters();
                this.updateVideo();
                console.log('??');
                appProperties.textureNeedsUpdate = true;
            // });
            if(params.autoPlay) this.video.play();

            // this.setParameters();
        }else{
            console.error('you don\'t have neighter image nor imgUrl.');
        }

        appProperties.textureNeedsUpdate = true;
    }

    playVideo(){
        if(this.video) this.video.play();
    }

    pauseVideo(){
        if(this.video) this.video.pause();
    }

    _onLoadImg(){
        this.isLoaded = true;
        this.bind();
        this.updateImage();

    }

    updateImage(){
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.image);
    }

    updateVideo(){
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGB, this.gl.RGB, this.gl.UNSIGNED_BYTE, this.video);
    }

    bind(){
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    }

    setParameters(){
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
    }

    setCustomParameters(){
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    }

    update(){
        appProperties.textureNeedsUpdate = true;
    }
}