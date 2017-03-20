import {WebgGLProgram} from './webgl/WebgGLProgram';

class WebGLRenderer {
     constructor(params) {
         let _alpha = params.alpha || false;

         this.onContextLost = this.onContextLost.bind(this)
         this._canvas = params.canvas || document.createElement('canvas')
         this.domElement = this._canvas;

         try {
             let attributes = {
                 alpha : _alpha
             };
             this.gl = this._canvas.getContext('webgl2', attributes);

             if(this.gl === null){
                 throw `Error creating webgl2 context`;
             }

             this._canvas.addEventListener('webglcontextlost', this.onContextLost, false);
         } catch (error) {
             console.error( 'WebGLRenderer: ' + error );
         }

     }

     onContextLost( event ){

         event.preventDefault();

     }

     createProgram( vertexShaderSource, fragmentShaderSource ){
         let webglProgram =  new WebgGLProgram({
             gl : this.gl,
             vertexShaderSource : vertexShaderSource,
             fragmentShaderSource : fragmentShaderSource
         });

         return webglProgram.program;
     }

     setSize(width, height){
         this._canvas.width = width;
         this._canvas.height = height;

         this.gl.viewport(0, 0, width, height);
     }
 }

 export {WebGLRenderer};