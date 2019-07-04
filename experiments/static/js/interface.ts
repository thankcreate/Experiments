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