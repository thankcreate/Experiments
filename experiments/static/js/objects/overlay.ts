var nyuAbout = `The NYU Game Center is dedicated to the exploration of games as a cultural form and game design as creative practice. Our approach to the study of games is based on a simple idea: games matter. Just like other cultural forms – music, film, literature, painting, dance, theater – games are valuable for their own sake. Games are worth studying, not merely as artifacts of advanced digital technology, or for their potential to educate, or as products within a thriving global industry, but in and of themselves, as experiences that entertain us, move us, explore complex topics, communicate profound ideas, and illuminate elusive truths about ourselves, the world around us, and each other.
`

var googleAbout = `Experiment 65536 is made with the help of the following solutions from Google:

TensorFlow TFHub universal-sentence-encoder: Encodes text into high-dimensional vectors that can be used for text classification, semantic similarity, clustering and other natural language tasks

Quick, Draw! The Data: These doodles are a unique data set that can help developers train new neural networks, help researchers see patterns in how people around the world draw, and help artists create things we haven’t begun to think of.

Google Cloud Text-to-Speech API (WaveNet): Applies groundbreaking research in speech synthesis (WaveNet) and Google's powerful neural networks to deliver high-fidelity audio
`

// The wrapped PhText is only for the fact the Wrapper must have a T
// We don't really use the wrapped object
class Overlay extends Wrapper<PhText> {
    
    bkg: Rect;

    dialog: Dialog;
    inShow: boolean = false;;

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
             content: nyuAbout
         });
         this.dialog.setOrigin(0.5, 0.5);
         this.dialog.okBtn.clickedEvent.on(()=>{
            this.hide();
         });

        this.dialog.inner.setVisible(false);
        this.hide();
    } 

    showAboutDialog() {
        this.dialog.setContent(nyuAbout, "NYU Game Center");
        this.show();
        this.dialog.show();
    }

    showGoogleDialog() {
        this.dialog.setContent(googleAbout, "Solutions");
        this.show();
        this.dialog.show();
    }

    show() {
        this.inShow = true;
        this.inner.setVisible(true);
    }

    hide() {
        this.inShow = false;
        this.inner.setVisible(false);
    }

    isInShow(): boolean {
        return this.inShow;
    }
}