/// <reference path="scenes.ts" />

var config = {
    type: Phaser.AUTO,
    backgroundColor: '#EEEEEE',
    scale: {
        mode: Phaser.Scale.HEIGHT_CONTROLS_WIDTH,
        parent: 'phaser-example',
        width: 8000,
        height: 1200,
        minWidth: 1200
    },
    scene: [Controller, Scene1]
};



var game = new Phaser.Game(config);

window.addEventListener('resize', function (event) {
    let fuck = 1;
    myResize();
}, false);


//window.onload = () => {
//    var game = new Controller();
//};