
class Lexer {
    constructor(input) {
        this.token = [];

        let tokens =[];
        let cc, ii = 0;
        let advance = function(){ return cc = input[++ii]; };
        let  addToken = function(type, value){
            tokens.push({
                type : type,
                value : value
            });
        };
        while(ii < input.length){
            cc = input[ii];
            // console.log(cc);

            if (this.isWhiteSpace(cc)) advance();
            else if (this.isOperator(cc)) {
                addToken(cc);
                advance();
            }else if(this.isDigit(cc)){
                let num = cc;
                while (this.isDigit(advance())) num += cc;
                if (cc === ".") {
                    do num += cc; while (this.isDigit(advance()));
                }
                num = parseFloat(num);
                if (!isFinite(num)) throw "Number is too large or too small for a 64-bit double.";
                addToken("number", num);
            }else if(this.isIdentifier(cc)){
                let idn = cc;
                while(this.isIdentifier(advance())) {
                    // console.log(ii);
                    // console.log(cc);
                    idn += cc;
                }
                addToken("identifier", idn);
            }
            else throw "unrecognized token.";
        }
        addToken("(end)");

        console.log(tokens);
    }
    isOperator(c){
        return /[+\-*\/\^%=(),]/.test(c);
    }
    isWhiteSpace(c){
        return /\s/.test(c);
    }
    isDigit(c){
         return /[0-9]/.test(c);
    }
    isIdentifier(c){
        return typeof c === "string" && !this.isOperator(c) && !this.isDigit(c) && !this.isWhiteSpace(c);
    }
}

module.exports = Lexer;