/// <reference path="scene-2.ts" />

class Scene2L1 extends Scene2 {
    constructor() {
        super('Scene2L1');

    }

    getNormalGameFsm(): IFsmData {        
        return normal_2_1;
    }

}