type PhPoint = Phaser.Geom.Point;
class PhPointClass extends Phaser.Geom.Point{};
type PhText = Phaser.GameObjects.Text;
class PhTextClass extends Phaser.GameObjects.Text{};
type PhGraphics = Phaser.GameObjects.Graphics;
type PhContainer = Phaser.GameObjects.Container;
class PhContainerClass extends Phaser.GameObjects.Container{};
type PhImage = Phaser.GameObjects.Image;
class PhImageClass extends Phaser.GameObjects.Image{};
type PhScene = Phaser.Scene;
type Phgame = Phaser.Game;
type PhTween = Phaser.Tweens.Tween;
type PhMask = Phaser.Display.Masks.GeometryMask;
type PhEventEmitter = Phaser.Events.EventEmitter;
type PhCanvasTexture = Phaser.Textures.CanvasTexture;
type PhRenderTexture = Phaser.GameObjects.RenderTexture
type PhGO = Phaser.GameObjects.GameObject;
type PhTimeEvent = Phaser.Time.TimerEvent;
type Pany = Promise<any>;


type StateHandler = (state: FsmState) => void;
type StateUpdateHandler = (state: FsmState, arg2?, arg3?) => void;

type TweenConfig = Phaser.Types.Tweens.TweenBuilderConfig | any;
type PromiseMiddleware = (state, result) => Promise<any>;
type FsmAction = (state?: FsmState, result?, resolve?, reject?) => void;

interface OnOffable{
    on(event: string | symbol, fn: Function)
    off(event: string | symbol, fn: Function)
}


interface Updatable {
    update(time, dt)
}

  

class Wrapper<T extends PhGO> {
    scene: BaseScene
    parentContainer: PhContainer;
    inner: PhContainer;
    wrappedObject: T;

    /**
     * Target will be added into inner container
     * inner container will be added into parentContainer automatically
     * NO NEED to add this wrapper into the parent
     * @param scene 
     * @param parentContainer 
     * @param target 
     */
    constructor(scene: BaseScene, parentContainer: PhContainer, x: number, y: number, target: T) {
        this.scene = scene;
        this.parentContainer = parentContainer;

        this.inner = this.scene.add.container(x, y);
        this.parentContainer.add(this.inner);

        // Sometimes in the interitace classes the 'target' is undefined
        // because super constructor need call first
        if(target) {
            this.applyTarget(target);
        }        
        
        this.init();
    }

    init() {

    }

    applyTarget(target: T) {
        this.wrappedObject = target;
        this.inner.add(target);
    }


    add(go: PhGO) {
        this.inner.add(go);
    }

    setScale(x: number, y?: number): any {
        this.inner.setScale(x, y);
        return this;
    }

    getX() {
        return this.inner.x;
    }
    
    getY() {
        return this.inner.y;
    }

    setPosition(x: number, y: number) {
        this.inner.x = x;
        this.inner.y = y;
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