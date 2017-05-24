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
            this.image = image;
            this._onLoadImg();
            this.isLoaded = true;
        }else if(params.imgUrl){
            this.image = new Image();
            this.image.onload = () => this._onLoadImg();
            this.image.src = params.imgUrl;
            this.isLoaded = false;
        }else{
            console.error('you don\'t have neighter image nor imgUrl.');
        }

        this.bind();
    }

    _onLoadImg(){
        this.isLoaded = true;
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.image)
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
    }

    bind(){
        this.gl.activeTexture(this.textureUnit);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    }
}