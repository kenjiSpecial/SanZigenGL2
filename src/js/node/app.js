const fs = require('fs');
const Lexer = require('./lexer')

let parameter = process.argv[2];
let lexer;

fs.readFile( parameter, 'utf8', readFile );

function readFile(err, data){
    if(err){
        console.log(err);
        return;
    }
    console.log(data);

    lexer = new Lexer(data);
}