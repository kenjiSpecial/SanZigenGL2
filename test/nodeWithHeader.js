const fs = require('fs');
const CDP = require('chrome-remote-interface');
const connect = require('connect');
const serveStatic = require('serve-static');

connect().use(serveStatic(__dirname)).listen(8080, function(){

    CDP(async (client) => {
        const {Page, Network} = client;
        try {
            await Network.enable();
            await Page.enable();
            console.log('enable?');
            await Page.navigate({url: 'http://localhost:8080/'});
            console.log('naviage');
            await Page.loadEventFired();
            console.log('loadEventFired');
            const {data} = await Page.captureScreenshot();
            fs.writeFileSync('scrot.png', Buffer.from(data, 'base64'));
            console.log('done');
            process.exit(1);
        } catch (err) {
            console.error(err);
        }
        await client.close();
    }).on('error', (err) => {
        console.error(err);
    });
});