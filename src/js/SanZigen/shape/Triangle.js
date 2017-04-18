import Shape from "./Shape";

const glslify = require('glslify');

export default class Triangle extends Shape {
    constructor(params){
        super({
            render : params.render,

        })
    }

}