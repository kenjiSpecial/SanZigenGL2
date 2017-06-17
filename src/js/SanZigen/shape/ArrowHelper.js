"use strict";

import {Vector2, Vector3, Color, Euler, Quaternion, Matrix4, Line} from '../index';

export class ArrowHelper extends Line{
    constructor(params){
        super(params);

        this.size = params.size ? params.size : 10;
        this.fromPt = new Vector3(0, 0, 0);
        this.upVec = new Vector3(0, 1, 0);
        this.direction = params.direction ? params.direction : new Vector3(1, 0, 0);

        console.log(this.direction);

        this._updatePts();
        this.updateDirection();
    }
    _updatePts(){
        let theta = Math.PI * 4/5;
        let rad = Math.max(3, 12/100 * this.size);

        let pt0 = new Vector3(0, 0, 0);
        let pt1 = new Vector3(this.size, 0, 0);
        let pt2 = new Vector3(this.size + rad * Math.cos(theta), rad * Math.sin(theta), 0);
        let pt3 = pt1.clone();
        let pt4 = new Vector3(this.size + rad * Math.cos(-theta), rad * Math.sin(-theta), 0);
        let pt5 = pt1.clone();

        this.updatePts([pt0, pt1, pt2, pt3, pt4, pt5]);
    }
    updateDirection(){
        this.rotationQuaternion.setFromUnitVectors(new Vector3(1, 0, 0), this.direction);
        this.updateModelMatrix();

        return this;
    }
}