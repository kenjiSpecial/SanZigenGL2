'use strict';

// import App from './apps/App';
// import App from './apps/OrthoApp';
// import App from './apps/App02'
// import App from './apps/App03'
// import App from './apps/AppTriangle';
// import App from './apps/AppCircle';
import App from './apps/AppRectangles';

let app;

(() =>{
    init();
    start();
})();

function init(){
    app = new App({
        isDebug: true
    });
    app.resize();

    document.body.appendChild(app.domElement);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
}

function start(){
    app.animateIn();
}


function onDocumentMouseMove(event){

    let mouseX = ( event.clientX / window.innerWidth ) * 2 - 1;
    let mouseY = -( event.clientY / window.innerHeight ) * 2 + 1;

    app.onMouseMove({x: mouseX, y: mouseY});
}

window.addEventListener('resize', function(){
    app.resize();
});

window.addEventListener('keydown', function(ev){
    app.onKeyDown(ev);
});
