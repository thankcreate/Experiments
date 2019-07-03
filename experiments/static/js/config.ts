/// <reference path="scenes/scenes-1.ts" />
/// <reference path="scenes/scene-controller.ts" />

var gameplayConfig = {
    enemyDuratrion: 25000,
    spawnInterval: 8000,

    onlyDamageMostMatch: true,
    tryAvoidDuplicate: true,

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
    healthIndicatorWidth: 32
}

var phaserConfig = {
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