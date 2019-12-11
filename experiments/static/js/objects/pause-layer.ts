class PauseLayer extends Wrapper<PhText> {

    bkg: Rect;
    title: PhText;

    constructor(scene: BaseScene, parentContainer: PhContainer, x: number, y: number) {
        super(scene, parentContainer, x, y, null);
       

        // Big banner
        this.bkg = new Rect(this.scene, this.inner, 0,0, {
            originX: 0.5,
            originY: 0.5,
            width: 3000,
            height: 2000,
            fillColor: 0x000000,
            fillAlpha: 0.7,
            lineColor: 0x000000,
            lineAlpha: 0,
        });
        
        // Title
        let style = getDefaultTextStyle();
        style.fill = '#ffffff';
        style.fontSize = '100px';

        this.title = this.scene.add.text(0, 0, "Paused", style).setOrigin(0.5).setAlign('center');        
        this.inner.add(this.title);        
    }

    tw: PhTween;
    hide() {
        this.inner.setVisible(false);        
        if(this.tw)
            this.tw.stop();
        this.tw = this.scene.tweens.add({
            targets: this.inner,
            alpha: 0,
            duration: 150,
        })
    }

    show() {
        this.inner.setVisible(true);        
        if(this.tw)
            this.tw.stop();
        this.tw = this.scene.tweens.add({
            targets: this.inner,
            alpha: 1,
            duration: 80,
        })
    }    
}