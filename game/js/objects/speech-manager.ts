class SpeechManager {

    loadedSpeechFiles = {};

    scene: Phaser.Scene;
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    quickLoadAndPlay(text: string) {
        apiTextToSpeech2(text, "no_id", (oReq) => {
            console.log("oa");
            var arrayBuffer = oReq.response;            
            
            // this blob may leak memory
            var blob = new Blob([arrayBuffer], {type: "audio/mpeg"});
            var url = URL.createObjectURL(blob);            
            console.log(url);
            this.phaserLoadAndPlay(text, text, url);

            // this.scene.load.cacheManager.audio.add("hahakey", arrayBuffer);
            // this.scene.sound.play("hahakey");            
            // var audio = new Audio(url);
            // audio.load();
            // audio.play();
        });
    }

    serverLoadAndPlay(text: string) {
        apiTextToSpeech(text, "no_id", (sucRet) => {
            let retID = sucRet.id;
            let retText = sucRet.input;
            let retPath = sucRet.outputPath;
            let md5 = sucRet.md5;

            // console.log(sucRet);            
            // console.log("suc apiTextToSpeech: " + retText);
            this.phaserLoadAndPlay(retText, md5, retPath);
        });

    }

    clearSpeechCache() {
        this.scene.load.cacheManager.audio.entries.clear();
        for (let key in this.loadedSpeechFiles) {
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
            // console.log(fullPath);
            this.scene.load.audio(key, [fullPath]);
            let localThis = this;

            this.scene.load.addListener('filecomplete',
                function onCompleted(arg1, arg2, arg3) {
                    console.log("actually!!!!!!!!1");
                    localThis.loadedSpeechFiles[key] = true;
                    if (arg1 === key)
                        localThis.scene.sound.play(key);

                    localThis.scene.load.removeListener('filecomplete', onCompleted);
                });
            this.scene.load.start();
            // }
        }
    }
}