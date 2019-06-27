/// <reference path="scenes/scenes-1.ts" />
/// <reference path="scenes/scene-controller.ts" />
var gameplayConfig = {
        enemyDuratrion: 20000,
        spawnInterval: 4000,

        onlyDamageMostMatch: true,
        tryAvoidDuplicate: true,

        quickDrawDataPath: "assets/quick-draw-data/",
        defaultHealth: 3,
        damageTiers: [
                [0.8, 2],
                [0.5, 1],
                [0, 0]]
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