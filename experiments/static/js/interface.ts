type PhPoint = Phaser.Geom.Point;
type PhText = Phaser.GameObjects.Text;
type PhGraphics = Phaser.GameObjects.Graphics;
type PhContainer = Phaser.GameObjects.Container;
type PhImage = Phaser.GameObjects.Image;
type PhScene = Phaser.Scene;
type Phgame = Phaser.Game;
type PhTween = Phaser.Tweens.Tween;
type PhMask = Phaser.Display.Masks.GeometryMask;


enum ErrorInputCode {
    NoError,
    Same,                   // input is the exactly the same as the enemy
    Contain,
    Wrap,
    TooShort,
    Repeat,                 // repeat input in the input box
    DamagedBefore,          // damaged by the same word before
    NotWord
}

interface SimResultItem {
    name: string,
    value: number
}

interface SimResult {
    input: string,
    array: string[],
    outputArray: SimResultItem[]
}

interface DamageResult {
    damage: number,
    code: ErrorInputCode,
}

interface TextStyle{
    fontSize: string,
    fill: string,
    fontFamily: string,
}
