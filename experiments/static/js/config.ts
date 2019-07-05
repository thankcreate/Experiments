/// <reference path="scenes/scenes-1.ts" />
/// <reference path="scenes/scene-controller.ts" />

var gameplayConfig = {
    enemyDuratrion: 30000,
    spawnInterval: 8000,

    onlyDamageMostMatch: false,
    allowDamageBySameWord: false, // wheather allow the same word to damage the same enemy multiple times

    tryAvoidDuplicate: true,

    allowSameInput: true,  // wheather allow same input accepted in the input box

    quickDrawDataPath: "assets/quick-draw-data/",
    defaultHealth: 3,
    damageTiers: [
        [0.8, 3],
        [0.5, 2],
        [0.4, 1],
        [0, 0]],

    defaultTextSize: '32px',
    defaultImageTitleSize: '28px',

    defaultFontFamily: "'Averia Serif Libre', Georgia, serif",
    defaultFontFamilyFirefox: "Georgia, serif",
    
    healthIndicatorFontFamily: '"Trebuchet MS", Helvetica, sans-serif',
    healthIndicatorWidth: 32,

    drawDataSample: 255,
    drawDataDefaultSize: 150
}

var phaserConfig = {
    // type: Phaser.AUTO,
    type: Phaser.CANVAS,
    backgroundColor: '#EEEEEE',
    // backgroundColor: '#E4E4E4',
    scale: {
        // mode: Phaser.Scale.HEIGHT_CONTROLS_WIDTH,
        // autoCenter: Phaser.Scale.CENTER_VERTICALLY,
        parent: 'phaser-example',
        width: 8000,
        // width: 1200,
        height: 1200,
        minWidth: 1200
    },
    canvasStyle: "vertical-align: middle;",
    scene: [Controller, Scene1]
};