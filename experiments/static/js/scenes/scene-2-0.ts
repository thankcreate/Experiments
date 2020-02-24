/// <reference path="scene-trailor.ts" />


class Scene2L0 extends SceneTrailor {
    
    constructor() {
        super('Scene2L0');
    }

    preload() {
        super.preload();
        this.load.image('center_rect', 'assets/center_rect.png');
    }

    createCenter(parentContainer: PhContainer): CenterObject {
        return new CenterObject(this, parentContainer, MakePoint2(220, 220), CenterType.Rect);
    }


    createDwitters(parentContainer: PhContainer) {
        // super.createDwitters(parentContainer);
        this.initCenterDwitterScale = 0.52;
        this.dwitterCenter = new DwitterHoriaontalRect(this, parentContainer, 0, 0, 1920, 1080, true).setScale(this.initCenterDwitterScale);
        this.dwitterBKG = new DwitterRectBKG(this, parentContainer, 0, 0, 2800, 1400, true);        
    }


    getOriginalTitle() {
        return 'Project 65537';
    }

    getChangedToTitle() {
        return 'Project 65537'
    }
}