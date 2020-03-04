class ButtonGroup extends Wrapper<PhText> {
    isShown = false;
}


/**
 * Toggle groups is intended to handle the keyboard event 
 * of the button group
 * However, since the name ButtonGroup is already used,
 * we call it ToggleGroup.
 * The difference is that, ButtonGroup contains a Phaser Layer in it while
 * ToggleGroup is more focused on the keyboard event
 */
class ToggleGroup {
    scene: BaseScene
    buttons: Button[]
    index = 0

    active = false;
    constructor(scene: BaseScene) {
        this.scene = scene;
        this.buttons = [];
        document.addEventListener('keydown', this.keydown.bind(this));
    }

    addButton(btn: Button) {
        btn.toggleGroup = this;
        this.buttons.push(btn);
    }

    setKeyboardActive(active: boolean = true) {        
        this.index = 0;
        this.active = active;
        // this.focus(0);
    }

    initFocus() {
        this.index = 0;
        this.focus(0);
        for(let i = 1; i < this.buttons.length; i++) {
            this.unfocus(i);
        }
    }

    updateIndexTo(btn: Button) {
        for(let i = 0; i < this.buttons.length; i++) {
            if(this.buttons[i] == btn) {
                this.index = i;
                break;
            }
        }
    }

    unfocusExept(btn: Button) {
        for(let i in this.buttons) {
            if(btn != this.buttons[i]) {
                this.unfocus(i);
            }
        }
    }
    
    focus(i) {
        this.buttons[i].focus();
    }

    unfocus(i) {
        this.buttons[i].unfocus();
    }

    keydown(event) {
        if(!this.active)
            return;

        if(!this.buttons || this.buttons.length == 0)
            return;

        var code = event.keyCode;
        let oriI = this.index;

        if(code == Phaser.Input.Keyboard.KeyCodes.DOWN || code == Phaser.Input.Keyboard.KeyCodes.RIGHT 
            || code == Phaser.Input.Keyboard.KeyCodes.LEFT || code == Phaser.Input.Keyboard.KeyCodes.UP) {                      
            
            if(code == Phaser.Input.Keyboard.KeyCodes.LEFT || code == Phaser.Input.Keyboard.KeyCodes.UP) {
                this.index--;            
                this.index += this.buttons.length;
                this.index %= this.buttons.length;  
            }
            else {
                this.index++;
                this.index %= this.buttons.length;        
            }

            this.unfocus(oriI);
            this.focus(this.index);        
        }        
        else if(code == Phaser.Input.Keyboard.KeyCodes.ENTER || code == Phaser.Input.Keyboard.KeyCodes.SPACE) {
            for(let i in this.buttons) {
                if(this.buttons[i].focused) {
                    this.buttons[i].click();
                }
            }
        }
    }
}

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

    toggleGroup: ToggleGroup;    

    hoverState: number = 0; // 0:out 1:in
    prevDownState: number = 0; // 0: not down  1: down

    enable: boolean = true;

    inTween: PhTween;
    outTween: PhTween;

    focused: boolean = false;

    desc: string;
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



        
        this.fakeZone.setInteractive()
        this.fakeZone.on('pointerover', ()=>{            
            this.pointerin();            
        });
        this.fakeZone.on('pointerout', ()=>{            
            this.pointerout();
        });
        this.fakeZone.on('pointerdown', ()=>{       
            this.click();
        });       

        
        // this.scene.input.setTopOnly(false);
        this.scene.updateObjects.push(this);                     
    }

                                       

    update(time, dt) {                   
       
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
                        
            let contains = this.scene.isObjectHovered(this.fakeZone);
            if(contains) {
                this.pointerin();  
            }            
        }
        
        this.enable = val;
        return this;
    }

    canClick: boolean = true;


    click() {
        if(!this.canClick) {
            return;
        }

        if(this.needInOutAutoAnimation) {          
            let timeline = this.scene.tweens.createTimeline(null);
            timeline.add({
                targets: this.animationTargets,
                scale: 0.9,
                duration: 40,
            });
            timeline.add({
                targets: this.animationTargets,
                scale: 1.16,
                duration: 90,
            });
            timeline.play();
        }

        this.clickedEvent.emit(this);
    }
    
    pointerin() {
        // We need to double check the hoverState here because in setEnable(true), 
        // if the pointer is alreay in the zone, it will get to pointerin directly
        // but if the pointer moved again, the mouseover event will also get us here
        if(this.hoverState === 1)
            return;
            
        this.hoverState = 1;

        this.focus();
    }

    
    focus() {
        if(this.needInOutAutoAnimation) {            
            this.scene.tweens.add({
                targets: this.animationTargets,
                scale: 1.16,
                duration: 100,
            })
            
            this.scene.playOneShot('ChooseLevel');                             
        }

        if(this.needTextTransferAnimation) {
            this.text.text = this.hoverTitle;
        }

        if(this.needHandOnHover) {
            $("body").css('cursor','pointer');
        }

        if(this.image) {
            this.image.alpha = 0.55;
        }
        
        if(this.toggleGroup) {            
            this.toggleGroup.updateIndexTo(this);
            this.toggleGroup.unfocusExept(this);
            this.text.text = '>' + this.originalTitle + '  ';
        }


        this.focused = true;
    }

    pointerout() {
        // Not like pointer in, I don't know if I need to double check like this
        // This is only for safe
        if(this.hoverState === 0)
            return;      

        this.hoverState = 0;

        if(!this.toggleGroup) {
            this.unfocus();            
        }        
    }

    unfocus(){
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
        
        if(this.image) {
            this.image.alpha = 1;
        }

        if(this.toggleGroup) {                        
            this.text.text = this.originalTitle;
        }

        this.focused = false;
    }

    setToHoverChangeTextMode(hoverText: string) {
        this.hoverTitle = hoverText;
        this.needInOutAutoAnimation = false;
        this.needTextTransferAnimation = true;
    }

    
}