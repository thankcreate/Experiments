class SpeechManager {

    loadedSpeechFiles = {};

    scene: Phaser.Scene;
    constructor(scene: Phaser.Scene) {
        this.scene = scene;        
    }

    serverLoadAndPlay(text: string) {
        apiTextToSpeech(text, "no_id", (sucRet) => {
            let retID = sucRet.id;
            let retText = sucRet.input;
            let retPath = sucRet.outputPath;
            let md5 = sucRet.md5;

            // use the md5 as the key
            // console.log("suc apiTextToSpeech: " + retText);
            this.phaserLoadAndPlay(retText, md5, retPath);
        });

    }    

    clearSpeechCache(){
        this.scene.load.cacheManager.audio.entries.clear();
        for(let key in this.loadedSpeechFiles) {
            this.scene.load.cacheManager.audio.remove(key);
        }
        this.loadedSpeechFiles = {};
    }

    phaserLoadAndPlay(text, key, fullPath) {
        // console.log("------------------------------");      
        let cached = this.scene.load.cacheManager.audio.has(key);        

        // double check
        if (this.loadedSpeechFiles.hasOwnProperty(key) && cached) {
            this.scene.sound.play(key);
        }
        else {            
            this.scene.load.audio(key, [fullPath]);

            let localThis = this;

            this.scene.load.addListener('filecomplete',
                function onCompleted(arg1, arg2, arg3) {
                    // console.log('Audio loaded: ' + text);
                    localThis.loadedSpeechFiles[key] = true;
                    if (arg1 === key)
                        localThis.scene.sound.play(key);

                    localThis.scene.load.removeListener('filecomplete', onCompleted);
                });
            this.scene.load.start();
        }
    }

}