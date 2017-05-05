// console.log(process.argv);

// example: node --inspect=9222 ./test/node.js


// const parse5 = require('parse5');
const cheerio = require('cheerio')
const argv = require('minimist')(process.argv.slice(2));
const connect = require('connect');
const serveStatic = require('serve-static');
const fileName = process.argv[2]
const fs = require('fs');
const CDP = require('chrome-remote-interface');
const {ChromeLauncher} = require('lighthouse/lighthouse-cli/chrome-launcher');


// console.log(fileName);
// console.log(__dirname);

// if(!fileName) return;


// connect().use(serveStatic(__dirname)).listen(8080, function(){
//     console.log('Server running on 8080...');
// });

// fs.readFile(__dirname + '/index.html',  'utf8', function(err, html){
//
//     if(err){
//         console.log(err);
//     }else{
//         parseHtml(html)
//     }
// });


function parseHtml(rawHtml){
    const $  = cheerio.load(rawHtml);



    $('div.parent').append(`<div>test</div>`)
    // console.log($.html());

    fs.writeFileSync(__dirname + '/index.html', $.html(), 'utf-8');
    // const parentNode = document.childNodes[1].childNodes[2].childNodes[1];
    // console.log(parentNode.childNodes);
}

function gettemplate(){

}


let launcher;
function launchChrome(headless = true) {
    launcher = new ChromeLauncher({
        port: 9222,
        autoSelectChrome: true, // False to manually select which Chrome install.
        additionalFlags: [
            '--window-size=800,600',
            // '--disable-gpu',
            headless ? '--headless' : ''
        ]
    });

    return launcher.run().then(() => launcher)
        .catch(err => {
            return launcher.kill().then(() => { // Kill Chrome if there's an error.
                throw err;
            }, console.error);
        });
}

// CDP(async (client) => {
//     const {Page} = client;
//     try {
//         await Page.enable();
//         await Page.navigate({url: 'https://github.com'});
//         await Page.loadEventFired();
//         const {data} = await Page.captureScreenshot();
//         fs.writeFileSync('scrot.png', Buffer.from(data, 'base64'));
//     } catch (err) {
//         console.error(err);
//     }
//     await client.close();
// }).on('error', (err) => {
//     console.error(err);
// });

// return;

launchChrome().then(launcher => {
    console.log('launch?');
    CDP(async (client) => {
        const {Page, Network} = client;
        try {
            await Network.enable();
            await Page.enable();
            console.log('enable?');
            await Page.navigate({url: 'https://github.com'});
            console.log('naviage');
            await Page.loadEventFired();
            console.log('loadEventFired');
            const {data} = await Page.captureScreenshot();
            fs.writeFileSync('scrot.png', Buffer.from(data, 'base64'));
            console.log('done');
        } catch (err) {
            console.error(err);
        }
        await client.close();
    }).on('error', (err) => {
        console.error(err);
    });
});

function exitHandler(options, err) {
    if (options.cleanup) console.log('clean');
    if (err) console.log(err.stack);
    if (options.exit) process.exit();

    launcher.kill();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));
