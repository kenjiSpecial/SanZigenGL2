import {WebGLProgram} from './webgl/WebGLProgram';

class WebGLRenderer {
     constructor(params = {}) {
         let _alpha = params.alpha || false;
         let _antialias = params.antialias || false;

         this.onContextLost = this.onContextLost.bind(this)
         this._canvas = params.canvas || document.createElement('canvas')
         this.domElement = this._canvas;

         try {
             let attributes = {
                 alpha : _alpha,
                 antialias : _antialias
                 // premultipliedAlpha : true
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

     createProgram( vertexShaderSource, fragmentShaderSource, params = {}){
         let webglProgram =  new WebGLProgram({
             gl : this.gl,
             vertexShaderSource : vertexShaderSource,
             fragmentShaderSource : fragmentShaderSource,
             transformFeedbackVaryingArray : params.transformFeedbackVaryingArray,
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