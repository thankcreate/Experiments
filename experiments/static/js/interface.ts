type PhPoint = Phaser.Geom.Point;
type PhText = Phaser.GameObjects.Text;
type PhGraphics = Phaser.GameObjects.Graphics;
type PhContainer = Phaser.GameObjects.Container;
type PhImage = Phaser.GameObjects.Image;
type PhScene = Phaser.Scene;
type Phgame = Phaser.Game;
type PhTween = Phaser.Tweens.Tween;
type PhMask = Phaser.Display.Masks.GeometryMask;
type PhEventEmitter = Phaser.Events.EventEmitter;
type PhCanvasTexture = Phaser.Textures.CanvasTexture;
type PhRenderTexture = Phaser.GameObjects.RenderTexture;

type PhGO = Phaser.GameObjects.GameObject;

class Wrapper<T extends PhGO> {
    scene: BaseScene
    parentContainer: PhContainer;
    inner: PhContainer;
    wrappedObject: T;

    constructor(scene: BaseScene, parentContainer: PhContainer, target: T) {
        this.scene = scene;
        this.parentContainer = parentContainer;

        this.inner = this.scene.add.container(0, 0);
        this.inner.add(target);
    }

    add(go: PhGO) {
        this.parentContainer.add(go);
    }
}

type ImageWrapper = Wrapper<PhImage>;
class ImageWrapperClass extends Wrapper<PhImage> {};

type TextWrapper = Wrapper<PhText>;
class TextWrapperClass extends Wrapper<PhText> {};


interface SpawnHistoryItem {
    degree: number; 
    name: string
}

enum GameState {
    Home,
    Scene1,
}

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

interface TextStyle {
    fontSize: string,
    fill: string,
    fontFamily: string,
}

interface Listener2<T1, T2> {
    (event1: T1, event2: T2): any;
}

interface Listener<T> {
    (event: T): any;
}

interface Disposable {
    dispose(): any;
}

class TypedEvent<T> {
    private listeners: Listener<T>[] = [];
    private listenersOncer: Listener<T>[] = [];

    public on = (listener: Listener<T>): Disposable => {
        this.listeners.push(listener);

        return {
            dispose: () => this.off(listener)
        };
    };

    public once = (listener: Listener<T>): void => {
        this.listenersOncer.push(listener);
    };

    public off = (listener: Listener<T>) => {
        const callbackIndex = this.listeners.indexOf(listener);
        if (callbackIndex > -1) this.listeners.splice(callbackIndex, 1);
    };

    public emit = (event: T) => {
        this.listeners.forEach(listener => listener(event));

        this.listenersOncer.forEach(listener => listener(event));

        this.listenersOncer = [];
    };

    public pipe = (te: TypedEvent<T>): Disposable => {
        return this.on(e => te.emit(e));
    };
}