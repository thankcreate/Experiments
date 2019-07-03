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
    Same,
    Contain,
    Wrap,
    TooShort,
    Repeat,
    NotWord
}

interface ErrorInput {
    code: ErrorInputCode,
    enemyName: string
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

interface TextStyle{
    fontSize: string,
    fill: string,
    fontFamily: string,
}
