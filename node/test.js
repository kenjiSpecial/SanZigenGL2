const fs = require('fs');
const CDP = require('chrome-remote-interface');
const connect = require('connect');
const serveStatic = require('serve-static');
const readline = require('readline');
const cheerio = require('cheerio');

let articleTemplate = require('./template').articleTemplate;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let $, title, url, description, date, titleId, imgUrl;
let $index, $article, fileName, targetHTML;
let readCnt = 0;

rl.question('what html do you want to capture screeshot? ', (fileName) => {
    targetHTML = fileName;

    rl.close();

    fs.readFile(__dirname + '/../test/' + fileName, 'utf8', function(err, html){
        if(err){
            console.log(err);
        }else{
            $ = cheerio.load(html);
            title = $('title').html();
            titleId = title.replace(/\s+/g, '-').toLowerCase();
            url = `./${targetHTML}`;
            imgUrl = `./img/${titleId}.jpg`
            description = $(".description").html().trim();
            date = getFormattedDate();

            readCnt++;
            if(readCnt === 2) loaded();

        }
    });

    fs.readFile(__dirname + '/../test/index.html', (err, html)=>{
        if(err){

        }else{
            $index = cheerio.load(html);

            readCnt++;
            if(readCnt === 2) loaded();
        }
    });

});

function loaded(){
    $article = $index(`.article-${titleId}`);
    console.log($article.length);

    if($article.length === 0) addArticle();
    else                      updateArticle();

    fs.writeFileSync(__dirname + '/../test/index.html', $index.html(), 'utf-8');
    console.log('takeScreenshot');
    takeScreenShot();
    // process.exit(1);
}

function addArticle(){
    var $gallery = $index('.gallery');
    var tempalte = articleTemplate(title, titleId, url, imgUrl, title, description, date);
    $gallery.append(tempalte)
}

function updateArticle(){

    $article.find('.article-title').text(title);
    $article.find('.article-desc').text(description);
    $article.find('.article-date').text(date);
}

function getFormattedDate(){
    var today = new Date();

    var dd   = today.getDate();
    var mm   = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    var hour = today.getHours();
    var minu = today.getMinutes();

    if(dd<10)  { dd='0'+dd }
    if(mm<10)  { mm='0'+mm }
    if(minu<10){ minu='0'+minu }
    if(hour < 10) { hour = '0' + hour }
    if(minu < 10) { minu = '0' + minu }

    let date = `${yyyy}/${mm}/${dd} ${hour}:${minu}`;
    console.log(date);
    return date;
}


function takeScreenShot(){
    connect().use(serveStatic( './')).listen(8080, function(){

        CDP(async (client) => {
            const {Page, Network} = client;
            Page.screencastFrame(string=>{
                console.log(string);
            })
            // let targetHTML = fileName; 'test0Triangle.html';
            let url = `http://localhost:8080/test/${targetHTML}`
            try {
                await Network.enable();
                await Page.enable();
                console.log('enable?');
                await Page.navigate({url: url});
                console.log('naviage');
                await Page.loadEventFired();
                console.log('loadEventFired');
                const {data} = await Page.captureScreenshot({formt: "jpg"});
                fs.writeFileSync(`./test/img/${titleId}.jpg`, Buffer.from(data, 'base64'));
                console.log('done');
            } catch (err) {
                console.error(err);
            }


            await client.close();
            process.exit();
        }).on('error', (err) => {
            console.error(err);
        });
    });

}

