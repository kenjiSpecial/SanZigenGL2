import {Matrix4} from '../math/Matrix4';

// perspective camera
class PerspectiveCamera {
  constructor() {
      this.projectionMatrix = new Matrix4();
  }
  setProjectionMatrix(fov, aspect, near, far){
      this.near = near; this.far = far; this.fov = fov; this.aspect = aspect;

      // let top =
  }
}

export {PerspectiveCamera};