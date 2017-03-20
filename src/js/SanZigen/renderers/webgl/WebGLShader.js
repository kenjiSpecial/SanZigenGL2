
function addLineNumbers( string ) {

    let lines = string.split( '\n' );

    for ( let i = 0; i < lines.length; i ++ ) {

        lines[ i ] = ( i + 1 ) + ': ' + lines[ i ];

    }

    return lines.join( '\n' );

}

export function webGLShader( gl, type, shaderSource ){
    let shader = gl.createShader(type);

    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    if(gl.getShaderParameter(shader, gl.COMPILE_STATUS) === false){

        console.error('[WebGLShader]: Shader couldn\'t compile.');
    }

    if ( gl.getShaderInfoLog( shader ) !== '' ) {

        console.warn( '[WebGLShader]: gl.getShaderInfoLog()', type === gl.VERTEX_SHADER ? 'vertex' : 'fragment', gl.getShaderInfoLog( shader ), addLineNumbers( shaderSource ) );

        return null;
    }

    return shader;
}