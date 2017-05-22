import {Matrix4} from '../math/Matrix4';
import {Vector3} from '../math/Vector3';
import {Euler} from '../math/Euler';
import {Quaternion} from '../math/Quaternion'

// perspective camera
class PerspectiveCamera {
    constructor(){
        this._onChangeRotation = this._onChangeRotation.bind(this);
        this._onChangeQuaternion = this._onChangeQuaternion.bind(this);

        this.projectionMatrix = new Matrix4();
        this.viewMatrix = new Matrix4();
        this.viewInverseMatrix = new Matrix4();

        this.position = new Vector3();
        this.rotation = new Euler();
        this.scale = new Vector3(1, 1, 1);
        this.quaternion = new Quaternion();
        this.up = new Vector3(0, 1, 0);
        this._rotationMat = new Matrix4();
    }

    setProjectionMatrix(fov, aspect, near, far){
        this.near = near;
        this.far = far;
        this.fov = fov;
        this.aspect = aspect;

        let top = this.near * Math.tan(0.5 * this.fov / 180 * Math.PI);
        let height = 2 * top;
        let width = this.aspect * height;
        let left = -0.5 * width;

        this.projectionMatrix.makeFrustum(
            left, left + width, top - height, top, near, far
        );
    }

    _onChangeRotation(){
        this.quaternion.setFromEuler(this.rotation);
        this.updateViewMatrix();
    }

    _onChangeQuaternion(){
        this.rotation.setFromQuaternion(this.quaternion);
        this.updateViewMatrix();
    }

    updateViewMatrix(){
        this.viewMatrix.compose(this.position, this.quaternion, this.scale);
        this.viewInverseMatrix.getInverse(this.viewMatrix);
        return this;
    }

    lookAt(target){
        this._rotationMat.lookAt( this.position, target, this.up);
        this.quaternion.setFromRotationMatrix(this._rotationMat);
        return this;
    }

    toViewArray(){
        return this.viewInverseMatrix.toArray();
    }

    toProjectionArray(){
        return this.projectionMatrix.toArray();
    }

}

export {PerspectiveCamera};