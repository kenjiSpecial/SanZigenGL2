let instance = null;
export class ShaderCache {
    constructor( params ) {
        if(!instance){
            instance = this;
            this._initialize();
        }
    }
    _initialize(){
        this.caches = {};
    }
}