import {WebGLProgram} from './webgl/WebGLProgram';

class WebGLRenderer {
     constructor(params = {}) {
         let _alpha = params.alpha || false;
         let _antialias = params.antialias || false;

         this.onContextLost = this.onContextLost.bind(this)
         this._canvas = params.canvas || document.createElement('canvas')
         this.domElement = this._canvas;

         this.capabilities = {};
         this.currentClearStencil = null;
         this.currentClearDepth = null;
         this.currentDepthFunc = null;
         this.currentCullFace = null;
         this.isCurrentFlipSided = null;

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

             this._init();

             this._canvas.addEventListener('webglcontextlost', this.onContextLost, false);
         } catch (error) {
             console.error( 'WebGLRenderer: ' + error );
         }
     }

     clear(color = true, depth = true, stencil = true){
        let bits = 0;
        if(color) bits |= this.gl.COLOR_BUFFER_BIT;
        if(depth) bits |= this.gl.DEPTH_BUFFER_BIT;
        if(stencil) bits |= this.gl.STENCIL_BUFFER_BIT;

         this.gl.clear(bits);
     }

     clearColor(r,g, b, a){
         this.gl.clearColor(r, g, b, a);
     }

     _init(){
         this.clearColor(0, 0, 0, 1);
         this.clearDepth(1);
         this.clearStencil(0);

         this.enable( this.gl.DEPTH_TEST );
         this.setDepthFunc()

         this.enable(this.gl.DEPTH_TEST);
         this.setDepthFunc(this.gl.LEQUAL);

         this.setFlipSided(false);
         this.enable(this.gl.CULL_FACE);
         this.setCullFace()


         // this.enable(this.gl.BLEND);
         // this.setBlending(this.gl.BLEND);
     }

     clearStencil(stencil){
         if(this.currentClearStencil !== stencil){
             this.gl.clearStencil(stencil);
             this.currentClearStencil = stencil;
         }
     }

     clearDepth(depth){
        if( this.currentClearDepth !== depth ){
            this.gl.clearDepth(depth);
            this.currentClearDepth = depth;
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

     enable(id){

        if( this.capabilities[id] !== true) {

            this.gl.enable(id);
            this.capabilities[id] = true;

        }
     }

     disable(id){

         if(this.capabilities[id] !== false){

             this.gl.disable(id);
             this.capabilities[id] = false;

         }
     }

     setDepthFunc(id = 0x0203 ){ // LEQUAL	0x0203 // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Constants

         if(this.currentDepthFunc === id)this.gl.depthFunc(id);

         this.currentDepthFunc = id;
     }

     // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/frontFace
     setFlipSided(isFlipSided){
            if(this.isCurrentFlipSided !== isFlipSided){
                if(isFlipSided) {
                    this.gl.frontFace( this.gl.CW );
                } else {
                    this.gl.frontFace(this.gl.CCW);
                }

                this.isCurrentFlipSided = isFlipSided;
            }
     }

    // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Constants
    // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/cullFace
    setCullFace(id=0x0408 /** gl.FRONT_AND_BACK **/){
         if(id !== this.currentCullFace){
             this.gl.cullFace(this.gl.FRONT);
             this.currentCullFace = id;
         }
    }

    // setBlending(id=)

 }

 export {WebGLRenderer};