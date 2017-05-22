var GIFEncoder = require('gifencoder');

function createGifEncoder(resolution, response) {

    var encoder = new GIFEncoder(resolution.x * 32, resolution.y * 32);

    var stream = encoder.createReadStream();
    response.type("gif");
    stream.pipe(response);

    encoder.start();

    // Set GIF parameters
    encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat
    encoder.setDelay(150);  // frame delay in ms
    encoder.setQuality(15); // image quality. 10 is default.

    return encoder;

}

function sendAsGIF(response, canvas) {

    var encoder = createGifEncoder({x: canvas.width, y: canvas.height}, response);

    var context = canvas.getContext("2d");

    // Add 3 frames
    encoder.addFrame(context);
    encoder.addFrame(context);
    encoder.addFrame(context);

    encoder.finish();
};

module.exports = {
    sendAsGIF : sendAsGIF
}