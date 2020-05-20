


class GlobalEventManager {

    private static instance: GlobalEventManager;    
    
    newspaperButtonTopClickedEvent: TypedEvent<GlobalEventManager> = new TypedEvent();
    newspaperButtonBottomClickedEvent: TypedEvent<GlobalEventManager> = new TypedEvent();
    dragStartEvent: TypedEvent<any> = new TypedEvent();

    constructor() {
    }
    
    static getInstance(): GlobalEventManager {
        if(!GlobalEventManager.instance) {
            GlobalEventManager.instance = new GlobalEventManager();
        }
        return GlobalEventManager.instance;
    }

    newspaperButtonTopClicked() {
        this.newspaperButtonTopClickedEvent.emit(this);
    }

    newspaperButtonBottomClicked() {
        this.newspaperButtonBottomClickedEvent.emit(this);
    }

    dragStart(e: any) {
        this.dragStartEvent.emit(e);
    }

    isChrome() {
        var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
        return isChrome;
    }
}


function newspaperButtonTopClicked(){
    GlobalEventManager.getInstance().newspaperButtonTopClicked();
}

function newspaperButtonBottomClicked() {
    GlobalEventManager.getInstance().newspaperButtonBottomClicked();
}

