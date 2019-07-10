class Button {
    scene: BaseScene
    parentContainer: PhContainer;
    inner: PhContainer;

    image: PhImage;
    text: PhText;

    fakeZone: PhImage;
    debugFrame: PhGraphics;

    eventTarget: any;

    hoverState: number = 0;

    enable: boolean = true;

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
        width?: number, height?: number, debug?: boolean) {
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
        this.text = this.scene.add.text(0, 0, title, style).setOrigin(0.5).setAlign('center');
        this.inner.add(this.text);

        if (width && height) {
            this.fakeZone = this.scene.add.image(0, 0, 'unit_white').setOrigin(0.5);
            this.fakeZone.setScale(width / 100, height / 100);       
            this.inner.add(this.fakeZone);
            this.eventTarget = this.fakeZone;

            if(debug) {
                this.debugFrame = this.scene.add.graphics();
                this.debugFrame.lineStyle(4, 0xFF0000, 1);
                this.debugFrame.strokeRect(-width / 2, -height / 2, width, height);
                this.inner.add(this.debugFrame);
            }
        }
        else if (this.image) {
            this.eventTarget = this.image;
        }
        else {
            this.eventTarget = this.text;
        }         
        
        this.eventTarget.setInteractive();        

        this.text.update = ()=>{
            console.log('haha');
        }

        this.scene.updateObjects.push(this);        
    }

    

    update(time, dt) {
        if(!this.enable) {
            return;
        }

        this.checkMouseEventInUpdate();
    }

    setEnable(val: boolean, needFade: boolean) : Button{         
        // hide
        if(val! && this.enable) {
  
            this.hoverState = 0; 
            if(needFade) {
                FadePromise.create(this.scene, this.inner, 0, 500);
            }
        }
        // show
        else if(val && !this.enable) {
            if(needFade) {
                FadePromise.create(this.scene, this.inner, 1, 500);
            }
        }

        

        this.inner.setVisible(val);
        this.enable = val;

        return this;
    }


    // 1: on   2: off
    setHoverState(st: number) {
        if(this.hoverState == 0 && st == 1) {
            this.pointerover();
        }
        else if(this.hoverState == 1 && st == 0) {
            this.pointerout();
        }
        this.hoverState = st;        
    }

    checkMouseEventInUpdate() {
        var pointer = this.scene.input.activePointer;
        let contains = this.fakeZone.getBounds().contains(pointer.x, pointer.y);
        this.setHoverState(contains ? 1 : 0);
        if(contains) {
            if(pointer.isDown) {
                this.click();
            }
        }
    }

    click() {
        console.log('click');
    }

    pointerover() {
        console.log('over');
    }

    pointerout() {
        console.log('out');
    }


}