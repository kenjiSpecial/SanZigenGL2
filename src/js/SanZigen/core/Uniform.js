
export class Uniform {

    constructor(params) {
        this.uniformInfo = params.uniformInfo;
        this.name = this.uniformInfo.name;
        if(params.uniformHandle){
            console.warn('[Uniform.js]: params.uniformHandle is not used anymore. use params.uniformLocation');
        }
        this.uniformLocation = params.uniformHandle || params.uniformLocation;
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
        if(this.cache === value0) return;

        this.cache = value0;
        this.gl.uniform1f(this.uniformLocation, value0);
    }
    set2f(value0, value1){
        if(this.cache && this.cache.x === value0 && this.cache.y === value1 ) return;

        this.cache = {x: value0, y : value1};
        this.gl.uniform2f(this.uniformLocation, value0, value1);
    }
    set3f(value0, value1, value2){
        if(this.cache && this.cache.x === value0 && this.cache.y === value1 && this.cache.z === value2 ) return;

        this.cache = {x: value0, y: value1, z: value2};
        this.gl.uniform3f(this.uniformLocation, value0, value1, value2);
    }
    set4f(value0, value1, value2, value3){
        if(this.cache && this.cache.x === value0 && this.cache.y === value1 && this.cache.z === value2 && this.cache.w === value3) return;

        this.cache = {x: value0, y: value1, z: value2, w: value3};
        this.gl.uniform4f(this.uniformLocation, value0, value1, value2, value3);
    }
    setMatrix(arrVal){
        if(arrVal.length !== 4 && arrVal.length !== 9 && arrVal.length !== 16){
            console.error(`we don\'t support: array length ${arrVal.length}`);
            return;
        }
        if(this.cache === arrVal) return;

        this.cache = arrVal;

        if(arrVal.length === 4){
            this.gl.uniformMatrix2fv( this.uniformLocation, false, arrVal);
        }else if(arrVal.length === 9){
            this.gl.uniformMatrix3fv( this.uniformLocation, false, arrVal);
        }else if(arrVal.length === 16){
            this.gl.uniformMatrix4fv( this.uniformLocation, false, arrVal);
        }
    }
    setMatrix4(arrVal){
        if(arrVal.length !== 16){
            console.error(`we need 16 items in array. we don\'t support: array length ${arrVal.length}`);
            return;
        }

        if(this.cache === arrVal) return;
        this.cache = arrVal;

        this.gl.uniformMatrix4fv( this.uniformLocation, false, arrVal);
    }
    setMatrix3(arrVal){
        if(arrVal.length !== 9){
            console.error(`we need 9 items in array. we don\'t support: array length ${arrVal.length}`);
            return;
        }

        if(this.cache === arrVal) return;
        this.cache = arrVal;

        this.gl.uniformMatrix3fv(this.uniformLocation, false, arrVal);
    }
    setMatrix2(arrVal){
        if(arrVal.length !== 4){
            console.error(`we need 4 items in array. we don\'t support: array length ${arrVal.length}`);
            return;
        }

        if(this.cache === arrVal) return;
        this.cache = arrVal;

        this.gl.uniformMatrix2fv(this.uniformLocation, false, arrVal);
    }

    set(value){
        console.log(arguments.length);
        if(this.cache === value) return;

        if(this.uniformCount === 1){
            this.gl.uniform1f(this.uniformLocation, value);
        }else if(this.uniformCount === 2){
            if(Array.isArray(value)){
                this.gl.uniform2fv(this.uniformLocation, value)
            }else{
                this.gl.uniform2f(this.uniformLocation, value.x, value.y)
            }
        }else if(this.uniformCount === 3){
            if(Array.isArray(value)){
                this.gl.uniform3fv( this.uniformLocation, value );
            }else{
                this.gl.uniform3f(this.uniformLocation, value.x, value.y, value.z);
            }
        }else if(this.uniformCount === 4){
            if(Array.isArray(value)){
                this.gl.uniform4fv(thihs.uniformLocation, value);
            }else{
                this.gl.uniform4f(thihs.uniformLocation, value.x, value.y, value.z, value.w);
            }
        }else{
            console.error(`make method for uniformCount:${this.uniformCount}`)
        }
    }

}