
export class Uniform {
    constructor(params) {
        this.uniformInfo = params.uniformInfo;
        this.name = this.uniformInfo.name;
        this.uniformHandle = params.uniformHandle;
        this.gl = params.gl;

        let UniformClass;
        let uniformCount;
        let gl = this.gl;
        switch (this.uniformInfo.type) {
            case gl.INT:
            case gl.BOOL:
            case gl.SAMPLER_2D:
            case gl.SAMPLER_CUBE:
                UniformClass = "Int";
                uniformCount = 1;
                break;
            case gl.FLOAT:
                UniformClass = "Float";
                uniformCount = 1;
                break;
            case gl.FLOAT_VEC2:
                UniformClass = "FloatVec2";
                uniformCount = 2;
                break;
            case gl.FLOAT_VEC3:
                UniformClass = "FloatVec3";
                uniformCount = 3;
                break;
            case gl.FLOAT_VEC4:
                UniformClass = "FloatVec4";
                uniformCount = 4;
                break;
            case gl.INT_VEC2:
                UniformClass = "IntVec2";
                uniformCount = 2;
                break;
            case gl.INT_VEC3:
                UniformClass = "IntVec3";
                uniformCount = 3;
                break;
            case gl.INT_VEC4:
                UniformClass = "IntVec4";
                uniformCount = 4;
                break;
            case gl.BOOL_VEC2:
                UniformClass = "BoolVec2";
                uniformCount = 2;
                break;
            case gl.BOOL_VEC3:
                UniformClass = "BoolVec3";
                uniformCount = 3;
                break;
            case gl.BOOL_VEC4:
                UniformClass = "BoolVec4"
                uniformCount = 4;
                break;
            case gl.FLOAT_MAT2:
                UniformClass = "Mat2";
                uniformCount = 4;
                break;
            case gl.FLOAT_MAT3:
                UniformClass = "Mat3";
                uniformCount = 9;
                break;
            case gl.FLOAT_MAT4:
                UniformClass = "Mat4";
                uniformCount = 16;
                break;
            default:
                console.error("Unrecognized type for uniform ", uniformInfo.name);
                break;
        }


        this.UniformClass = UniformClass;
        this.uniformCount = uniformCount;
    }
    set1f(value0){
        if(this.cache == value0) return;

        this.cache = x;
        this.gl.uniform1f(this.uniformHandle, value0);
    }
    set2f(value0, value1){
        if(this.cache && this.cache.x == value0 && this.cache.y == value1 ) return;

        this.cache = {x: value0, y : value1};
        this.gl.uniform2f(this.uniformHandle, value0, value1);
    }
    set(value){
        console.log(arguments.length);
        if(this.cache == value) return;

        if(this.uniformCount == 1){
            this.gl.uniform1f(this.uniformHandle, value);
        }else if(this.uniformCount == 2){
            if(Array.isArray(value)){
                this.gl.uniform2f(this.uniformHandle, value)
            }else{
                this.gl.uniform2f(this.uniformHandle, value.x, value.y)
            }
        }else if(this.uniformCount == 3){
            if(Array.isArray(value)){
                this.gl.uniform3f( this.uniformHandle, value );
            }else{
                this.gl.uniform3f(this.uniformHandle, value.x, value.y, value.z);
            }
        }
    }

}