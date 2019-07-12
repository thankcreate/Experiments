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
         });
         this.dialog.setOrigin(0.5, 0.5);
    } 
}