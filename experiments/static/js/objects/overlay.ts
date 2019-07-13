var nyuAbout = `NYU Game Center is the Department of Game Design at the New York University Tisch School of the Arts. It is dedicated to the exploration of games as a cultural form and game design as creative practice. Our approach to the study of games is based on a simple idea: games matter. Just like other cultural forms – music, film, literature, painting, dance, theater – games are valuable for their own sake. Games are worth studying, not merely as artifacts of advanced digital technology, or for their potential to educate, or as products within a thriving global industry, but in and of themselves, as experiences that entertain us, move us, explore complex topics, communicate profound ideas, and illuminate elusive truths about ourselves, the world around us, and each other.
`

var googleAbout = `Experiment 65536 is made with the help of the following solutions from Google:

TensorFlow TFHub universal-sentence-encoder: Encodes text into high-dimensional vectors that can be used for text classification, semantic similarity, clustering and other natural language tasks

Quick, Draw! The Data: A unique doodle data set that can help developers train new neural networks, help researchers see patterns in how people around the world draw, and help artists create things we haven’t begun to think of.

Google Cloud Text-to-Speech API (WaveNet): Applies groundbreaking research in speech synthesis (WaveNet) and Google's powerful neural networks to deliver high-fidelity audio
`

var aiAbout = `This AI experiment is a prospect study for a thesis project at NYU Game Center. It aims to explore how the latest AI tech can help to build a game feel. Rather than AI for games, this experiment is more focused on the concept of games for AI.

The developer has been a full-time solo indie game developer since 2012, became an IGF finalst in 2013, and has published several games on PC/Steam and other mobile platforms.
`

// The wrapped PhText is only for the fact the Wrapper must have a T
// We don't really use the wrapped object
class Overlay extends Wrapper<PhText> {
    
    bkg: Rect;

    dialog: Dialog;
    inShow: boolean = false;

    inTween: PhTween;

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
             contentBtnGap: 30, 
             btnToBottom: 65,                   
             content: nyuAbout,
             autoHeight: true
         });
         this.dialog.setOrigin(0.5, 0.5);
         this.dialog.okBtn.clickedEvent.on(()=>{
            this.hide();
         });

        this.dialog.inner.setVisible(false);
        this.hide();
    } 

    showAiDialog() {
        this.dialog.setContent(aiAbout, "AI Experiment");
        this.show();
        this.dialog.show();
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

        this.inner.alpha = 0;
        this.inTween = this.scene.tweens.add({
            targets: this.inner,
            alpha: 1,
            duration: 80,
        })
    }

    hide() {
        this.inShow = false;
        this.inner.setVisible(false);

        if(this.inTween) {
            this.inTween.stop();            
        }
    }

    isInShow(): boolean {
        return this.inShow;
    }
}