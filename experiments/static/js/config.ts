/// <reference path="scenes/scenes-1.ts" />
/// <reference path="scenes/scene-1-1.ts" />
/// <reference path="scenes/scene-1-2.ts" />
/// <reference path="scenes/scene-1-3.ts" />
/// <reference path="scenes/scene-controller.ts" />


var gameplayConfig = {
    enemyDuratrion: 30000,
    spawnInterval: 8000,
    // enemyDuratrion: 5000,
    // spawnInterval: 1000,

    onlyDamageMostMatch: false,
    allowDamageBySameWord: false, // wheather allow the same word to damage the same enemy multiple times

    tryAvoidDuplicate: true,

    allowSameInput: true,  // wheather allow same input accepted in the input box

    quickDrawDataPath: "assets/quick-draw-data/",
    defaultMyHealth: 10,    // default my health
    defaultEnemyHealth: 3,   // the default health of enemies
    damageTiers: [
        [0.8, 3],
        [0.5, 2],
        [0.4, 1],
        [0, 0]],

    defaultTextSize: '32px',
    defaultImageTitleSize: '28px',

    preloadFontFamily: "'Averia Serif Libre'",

    defaultFontFamily: "'Averia Serif Libre', Georgia, serif",
    defaultFontFamilyFirefox: "'Averia Serif Libre', Georgia, serif",
    
    


    titleFontFamily: "Georgia, serif",
    subtitleFontFamily:  "'Averia Serif Libre', Georgia, serif",



    healthIndicatorFontFamily: '"Trebuchet MS", Helvetica, sans-serif',
    healthIndicatorWidth: 32,

    drawDataSample: 255,
    drawDataDefaultSize: 150,

    titleOriginal: "Project 65535",
    titleChangedTo: "Project 65536",
}

var phaserConfig = {
    // type: Phaser.WEBGL,
    type: Phaser.CANVAS,
    // backgroundColor: '#FFFFFF',
    backgroundColor: '#EEEEEE',
    // backgroundColor: '#E4E4E4',
    scale: {
        // mode: Phaser.Scale.HEIGHT_CONTROLS_WIDTH,
        // autoCenter: Phaser.Scale.CENTER_VERTICALLY,
        parent: 'phaser-main',
        width: 8000,
        // width: 1200,
        height: 1200,
        minWidth: 1200
    },
    canvasStyle: "vertical-align: middle;",
    scene: [Controller, Scene1, Scene1L3, Scene1L2, Scene1L1]
};