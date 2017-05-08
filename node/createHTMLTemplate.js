/**
 * Created by ksait on 5/7/2017.
 */

const fs = require('fs');
const readline = require('readline');
const htmlTemplate = require('./template').htmlTemplate;
let dir, title;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('in which do you want to make: ', _dir => {
    dir = _dir;
    rl.question('what is the title of html: ', _title => {
        if(!_title) return;
        title = _title;

        fs.writeFileSync(__dirname + "/../" + _dir, htmlTemplate(title), 'utf-8')

        rl.close();
        process.exit();
    })
})