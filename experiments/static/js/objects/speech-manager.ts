class SpeechManager {

    loadedSpeechFilesStatic = {};
    loadedSpeechFilesQuick = {};

    scene: Phaser.Scene;
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }
    
    quickLoadAndPlay(text: string, play = true) {
        console.log("Begin quick load and play");

        // in quick mode the key is just the input text
        // we can judge if we have the key stored directly
        let key = text;
        let cachedInPhaser = this.scene.load.cacheManager.audio.has(key);
        let cachedByMySelf = this.loadedSpeechFilesQuick.hasOwnProperty(key);
        let cached = cachedInPhaser && cachedByMySelf;
        if(cached) {
            if(play) {
                // console.log("play cahced");
                this.scene.sound.play(key);
            }
        }
        else
        {
            apiTextToSpeech2(text, "no_id", (oReq) => {            
                console.log("suc in quickLoadAndPlay")
                
                var arrayBuffer = oReq.response;    
                // this blob may leak memory
                var blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
                var url = URL.createObjectURL(blob);
                // console.log(url);    
                this.phaserLoadAndPlay(text, text, url, false, play);
            },
            err => {
                console.log("error in quickLoadAndPlay")
            }            
            );
        }
    }

    staticLoadAndPlay(text: string, play = true) {
        apiTextToSpeech(text, "no_id", (sucRet) => {
            let retID = sucRet.id;
            let retText = sucRet.input;
            let retPath = sucRet.outputPath;
            let md5 = sucRet.md5;

            this.phaserLoadAndPlay(retText, md5, retPath, true, play);
        });

    }

    clearSpeechCacheStatic() {
        for (let key in this.loadedSpeechFilesStatic) {
            this.scene.load.cacheManager.audio.remove(key);
        }
        this.loadedSpeechFilesStatic = {};
    }

    clearSpeechCacheQuick() {
        for (let key in this.loadedSpeechFilesStatic) {
            this.scene.load.cacheManager.audio.remove(key);
        }
        this.loadedSpeechFilesQuick = {};
    }

    phaserLoadAndPlay(text, key, fullPath, isStatic = true, play = true) {

        // console.log("isStatic: " + isStatic);

        // console.log("------------------------------");      
        let cachedInPhaser = this.scene.load.cacheManager.audio.has(key);
        let cachedByMySelf = isStatic ?
            this.loadedSpeechFilesStatic.hasOwnProperty(key) :
            this.loadedSpeechFilesQuick.hasOwnProperty(key);

        // double check
        if (cachedByMySelf && cachedInPhaser) {
            this.scene.sound.play(key);
        }
        else {
            // console.log(fullPath);
            this.scene.load.audio(key, [fullPath]);
            let localThis = this;

            this.scene.load.addListener('filecomplete',
                function onCompleted(arg1, arg2, arg3) {
                    // console.log("actually!!!!!!!!1");
                    if (isStatic)
                        localThis.loadedSpeechFilesStatic[key] = true;
                    else
                        localThis.loadedSpeechFilesQuick[key] = true;

                    if (arg1 === key) {
                        if (play)
                            localThis.scene.sound.play(key);
                    }

                    localThis.scene.load.removeListener('filecomplete', onCompleted);
                });
            this.scene.load.start();            
        }
    }
}