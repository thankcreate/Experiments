class Hud extends Wrapper<PhText>  {
    constructor(scene: BaseScene, parentContainer: PhContainer, x: number, y: number) {
        super(scene, parentContainer, x, y, null);

    }


    update(time, dt) {
    }


    reset() {     
    }

    show(mode: GameMode) {
    }

    hide(mode: GameMode) {
        
    }

    handleHotkey(c: string) : boolean{    
        return false;
    }
}