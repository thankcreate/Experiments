class CenterObject {
    inner: PhContainer; 
    parentContainer: PhContainer; 
    scene: PhScene;

    designSize: number;

    horLine: PhGraphics
    tinyCircle: PhGraphics
    bigCircle: PhGraphics



    constructor(scene: PhScene, parentContainer: PhContainer, designSize: number) {
        this.scene = scene;
        this.parentContainer = parentContainer;
        this.designSize = designSize;

        this.inner = this.scene.add.container(0, 0);
        
        
    }
}