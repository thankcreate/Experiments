class SpeechManager {

    loadedSpeechFilesStatic = {};
    loadedSpeechFilesQuick = {};

    scene: Phaser.Scene;
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    /**
     * If after 'timeOut' the resource is still not ready to play\
     * cancel the whole process
     * @param text 
     * @param play 
     * @param timeOut 
     */
    quickLoadAndPlay(text: string, play = true, timeOut: number = 4000) : Pany {
        console.log("Begin quick load and play");

        // in quick mode the key is just the input text
        // we can judge if we have the key stored directly
        let key = text;
        let cachedInPhaser = this.scene.load.cacheManager.audio.has(key);
        let cachedByMySelf = this.loadedSpeechFilesQuick.hasOwnProperty(key);
        let cached = cachedInPhaser && cachedByMySelf;
        if (cached) {
            if (play) {
                // console.log("play cahced");
                return this.playSoundByKey(key);
            }
        }
        else {
            let apiAndLoadPromise = apiTextToSpeech2(text, "no_id")
                .then(oReq => {
                    //console.log("suc in quickLoadAndPlay")

                    var arrayBuffer = oReq.response;
                    // this blob may leak memory
                    var blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
                    var url = URL.createObjectURL(blob);
                    // console.log(url);    
                    return this.phaserLoad(text, text, url, false);
                });

            let ret = TimeOutRace.create(apiAndLoadPromise, timeOut, false)
                .then(key => {
                    if (play)
                        return this.playSoundByKey(key);
                })
                // .catch(e => {
                //     console.log("error in static load and play");
                //     console.log(e);
                // });

            return ret;
        }
    }

    /**
     * If after 'timeOut' the resource is still not ready to play\
     * cancel the whole process
     * @param text 
     * @param play 
     * @param timeOut 
     */
    staticLoadAndPlay(text: string, play = true, timeOut: number = 4000): Pany {
        let apiAndLoadPromise = apiTextToSpeech(text, "no_id")
            .then(sucRet => {
                let retID = sucRet.id;
                let retText = sucRet.input;
                let retPath = sucRet.outputPath;
                let md5 = sucRet.md5;
                return this.phaserLoad(retText, md5, retPath, true);
            });

        

        let ret = TimeOutRace.create(apiAndLoadPromise, timeOut, false)
            .then(key => {
                if(play)
                    return this.playSoundByKey(key);                    
            })
            // .catch(e => {
            //     console.log("error in static load and play");
            //     console.log(e);
            // });

        return ret;
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

    phaserLoad(text, key, fullPath, isStatic = true): Pany {

        // console.log("isStatic: " + isStatic);
        // console.log("------------------------------");      
        let cachedInPhaser = this.scene.load.cacheManager.audio.has(key);
        let cachedByMySelf = isStatic ?
            this.loadedSpeechFilesStatic.hasOwnProperty(key) :
            this.loadedSpeechFilesQuick.hasOwnProperty(key);

        // double check
        if (cachedByMySelf && cachedInPhaser) {
            return Promise.resolve(key);
        }
        else {
            // console.log(fullPath);
            return this.loadAudio(key, [fullPath], isStatic);
        }
    }



    // phaserLoadAndPlay(text, key, fullPath, isStatic = true, play = true): Pany {

    //     // console.log("isStatic: " + isStatic);
    //     // console.log("------------------------------");      
    //     let cachedInPhaser = this.scene.load.cacheManager.audio.has(key);
    //     let cachedByMySelf = isStatic ?
    //         this.loadedSpeechFilesStatic.hasOwnProperty(key) :
    //         this.loadedSpeechFilesQuick.hasOwnProperty(key);

    //     // double check
    //     if (cachedByMySelf && cachedInPhaser) {
    //         return this.playSoundByKey(key);
    //     }
    //     else {
    //         console.log(fullPath);
    //         return this.loadAudio(key, [fullPath], isStatic, play);
    //     }
    // }

    loadAudio(key: string, pathArray: string[], isStatic = true): Pany {
        return new Promise((resolve, reject) => {
            this.scene.load.audio(key, pathArray);
            let localThis = this;

            this.scene.load.addListener('filecomplete',
                function onCompleted(arg1, arg2, arg3) {
                    resolve(arg1);
                    localThis.scene.load.removeListener('filecomplete', onCompleted);
                });
            this.scene.load.start();
        })
            .then(suc => {
                if (isStatic)
                    this.loadedSpeechFilesStatic[key] = true;
                else
                    this.loadedSpeechFilesQuick[key] = true;

                if (suc === key)
                    return Promise.resolve(key);
                else
                    return Promise.reject("suc != key");
            });
    }

    playSoundByKey(key: string): Pany {
        return new Promise((resolve, reject) => {
            var music = this.scene.sound.add(key);
            music.on('complete', (param) => {
                resolve(param);
            });
            music.play();
        });
    }
}
