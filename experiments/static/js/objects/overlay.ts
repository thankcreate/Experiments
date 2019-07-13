var aboutContent = `The NYU Game Center is dedicated to the exploration of games as a cultural form and game design as creative practice. Our approach to the study of games is based on a simple idea: games matter. Just like other cultural forms – music, film, literature, painting, dance, theater – games are valuable for their own sake. Games are worth studying, not merely as artifacts of advanced digital technology, or for their potential to educate, or as products within a thriving global industry, but in and of themselves, as experiences that entertain us, move us, explore complex topics, communicate profound ideas, and illuminate elusive truths about ourselves, the world around us, and each other.
`
// The wrapped PhText is only for the fact the Wrapper must have a T
// We don't really use the wrapped object
class Overlay extends Wrapper<PhText> {
    
    bkg: Rect;

    dialog: Dialog;

    constructor(scene: BaseScene, parentContainer: PhContainer, x: number, y: number) {
         super(scene, parentContainer, x, y, null);

         let width = getLogicWidth();
         
         this.bkg = new Rect(this.scene, this.inner, 0, 0, {            
            fillColor: 0x000000,
            fillAlpha: 0.8,            
            width: width, 
            height: phaserConfig.scale.height,
            lineWidth: 0,
            originX: 0.5,
            originY: 0.5, 
         });

         this.dialog =  new Dialog(this.scene, this.inner, 0, 0, {
             fillColor: 0xbbbbbb,
             lineColor: 0x000000,
             lineWidth: 6,
             padding: 16,
             width: 1000,
             height: 700,
             title: 'About',
             titleContentGap: 40, 
             contentPadding: 60,  
             btnToBottom: 65,      
             content: aboutContent
         });
         this.dialog.setOrigin(0.5, 0.5);
         this.dialog.okBtn.clickedEvent.on(()=>{
            this.hide();
         });

        this.dialog.inner.setVisible(false);
        this.bkg.inner.setVisible(false);
    } 

    showAboutDialog() {
        this.dialog.setContent(aboutContent);
        this.show();
        this.dialog.show();
    }

    show() {
        this.inner.setVisible(true);
    }

    hide() {
        this.inner.setVisible(false);
    }
}