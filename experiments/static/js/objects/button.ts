/**
 * When you want to deactive a button \
 * Just call setEnable(false) \
 * Don't set the visibility or activity of the inner objects directly
 */
class Button {
    scene: BaseScene
    parentContainer: PhContainer;
    inner: PhContainer;

    image: PhImage;
    text: PhText;
    originalTitle: string;
    hoverTitle: string;

    fakeZone: PhImage;
    debugFrame: PhGraphics;

    hoverState: number = 0; // 0:in 1:out
    prevDownState: number = 0; // 0: not down  1: down

    enable: boolean = true;

    inTween: PhTween;
    outTween: PhTween;

    // auto scale
    needInOutAutoAnimation: boolean = true;    

    // auto change the text to another when hovered
    needTextTransferAnimation: boolean = false;

    // auto change the cursor to a hand when hovered
    needHandOnHover: boolean = false;


    clickedEvent: TypedEvent<Button> = new TypedEvent();

    ignoreOverlay = false;

    animationTargets: any[] = [];
    /**
     * Target will be added into inner container
     * inner container will be added into parentContainer automatically
     * NO NEED to add this wrapper into the parent
     * @param scene 
     * @param parentContainer 
     * @param target 
     */
    constructor(scene: BaseScene, parentContainer: PhContainer,
        x: number, y: number,
        imgKey: string, title: string,
        width?: number, height?: number,  debug?: boolean, fakeOriginX? : number, fakeOriginY?: number) {

        this.scene = scene;
        this.parentContainer = parentContainer;

        this.inner = this.scene.add.container(x, y);
        this.parentContainer.add(this.inner);

        if (imgKey) {
            this.image = this.scene.add.image(0, 0, imgKey);
            this.inner.add(this.image);
        }

        let style = getDefaultTextStyle();
        style.fill = '#FFFFFF';
        this.originalTitle = title;
        this.text = this.scene.add.text(0, 0, title, style).setOrigin(0.5).setAlign('center');
        this.inner.add(this.text);
        
        if(notSet(width)) width = this.image ? this.image.displayWidth : this.text.displayWidth;
        if(notSet(height)) height = this.image ? this.image.displayHeight : this.text.displayHeight;
     
        if(notSet(fakeOriginX)) fakeOriginX = 0.5;
        if(notSet(fakeOriginY)) fakeOriginY = 0.5;
        this.fakeZone = this.scene.add.image(0, 0, 'unit_white').setOrigin(fakeOriginX, fakeOriginY);
        this.fakeZone.setScale(width / 100, height / 100);       
        this.inner.add(this.fakeZone);

        if(debug) {
            this.debugFrame = this.scene.add.graphics();
            this.debugFrame.lineStyle(4, 0xFF0000, 1);
            this.debugFrame.strokeRect(-width * fakeOriginX, -height * fakeOriginY, width, height);
            this.inner.add(this.debugFrame);
        }
     

        if(this.image) this.animationTargets.push(this.image);
        if(this.text) this.animationTargets.push(this.text);

        

        this.scene.updateObjects.push(this);              
       
    }

    

    update(time, dt) {               
        this.checkMouseEventInUpdate();
    }

    setEnable(val: boolean, needFade: boolean) : Button{         
        // hide
        if(!val && this.enable) {  
            // console.log(this.text.text);
            this.hoverState = 0; 
            if(needFade) {
                FadePromise.create(this.scene, this.inner, 0, 500)
                .then(s=>{
                    this.inner.setVisible(false);
                }).catch(e=>{});
            }
            else {
                // console.log(this.text.text);
                this.inner.setVisible(false);
            }
        }
        // show
        else if(val && !this.enable) {
            this.text.text = this.originalTitle;
            this.animationTargets.forEach(e=>{
                e.setScale(1);
            })
            if(needFade) {
                this.inner.alpha = 0;
                FadePromise.create(this.scene, this.inner, 1, 500);                       
            }           

            this.inner.setVisible(true);
        }

        
        this.enable = val;

        return this;
    }


    // 1: on   2: off
    setHoverState(st: number) {
        if(this.hoverState == 0 && st == 1) {
            this.pointerin();
        }
        else if(this.hoverState == 1 && st == 0) {
            this.pointerout();
        }
        this.hoverState = st;        
    }

    checkMouseEventInUpdate() {
        var pointer = this.scene.input.activePointer;
        let contains = false;
        if(!this.canInteract())
            contains = false;
        else
            contains = this.fakeZone.getBounds().contains(pointer.x, pointer.y);

        this.setHoverState(contains ? 1 : 0);
        if(contains) {
            if(pointer.isDown && this.prevDownState === 0) {
                this.click();
            }       
        }
        this.prevDownState = pointer.isDown ? 1 : 0;
    }

    click() {
        if(this.needInOutAutoAnimation) {          
            let timeline = this.scene.tweens.createTimeline(null);
            timeline.add({
                targets: this.animationTargets,
                scale: 0.9,
                duration: 40,
            });
            timeline.add({
                targets: this.animationTargets,
                scale: 1.25,
                duration: 90,
            });
            timeline.play();
        }

        this.clickedEvent.emit(this);
    }

    pointerin() {     
        

        if(this.needInOutAutoAnimation) {            
            this.scene.tweens.add({
                targets: this.animationTargets,
                scale: 1.25,
                duration: 100,
            })
        }

        if(this.needTextTransferAnimation) {
            this.text.text = this.hoverTitle;
        }

        if(this.needHandOnHover) {
            $("body").css('cursor','pointer');
        }
    }

    pointerout() {
        if(this.needInOutAutoAnimation) {
            this.scene.tweens.add({
                targets: this.animationTargets,
                scale: 1,
                duration: 100,
            })
        }

        if(this.needTextTransferAnimation) {
            this.text.text = this.originalTitle;
        }

        if(this.needHandOnHover) {
            $("body").css('cursor','default');
        }
    }

    setToHoverChangeTextMode(hoverText: string) {
        this.hoverTitle = hoverText;
        this.needInOutAutoAnimation = false;
        this.needTextTransferAnimation = true;
    }

    canInteract() : boolean {     
        if(gOverlay && gOverlay.isInShow() && !this.ignoreOverlay) 
            return false;

        let container = this.inner;
        while(container != null) {
            if(!container.visible)
                return false;
            container = container.parentContainer;
        }

        if(!this.enable)
            return false;

        return true;
    }

}