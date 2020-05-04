declare function FMODModule(e);

let s_banks = [
    "Master.bank",
    "Master.strings.bank",
    "SE.bank",
    "BGM.bank"
]

class FmodManager {
    private static instance: FmodManager;
    FMOD:any = {};
    
    gSystem : any;                            
    gSystemCore: any;    
    gAudioResumed: boolean = false;

    loopingAmbienceInstance:any = {};

    emojiProgressInstance: any= {};

    constructor() {
        this.FMOD['preRun'] = ()=>{this.prerun()}; 
        this.FMOD['onRuntimeInitialized'] = ()=>{  
            this.main()
        };
        this.FMOD['TOTAL_MEMORY'] = 164*1024*1024; 
        FMODModule(this.FMOD); 
    }

    test() {
        this.loopingAmbienceInstance.val.start() 
    }

    static getInstance(): FmodManager {
        if(!FmodManager.instance) {
            FmodManager.instance = new FmodManager();
        }
        return FmodManager.instance;
    }

    CHECK_RESULT(result)
    {
        if (result != this.FMOD.OK)
        {
            var msg = "Error!!! '" + this.FMOD.ErrorString(result) + "'";
            alert(msg);
            throw msg;
        }
    }

    prerun() {
        // console.log('begin prerun');
        var fileUrl = "/banks/";        
        var folderName = "/";
        var canRead = true;
        var canWrite = false;
    
          
        for (var count = 0; count < s_banks.length; count++)
        {
            this.FMOD.FS_createPreloadedFile(folderName, s_banks[count], fileUrl + s_banks[count], canRead, canWrite);
        }

        // console.log('finish prerun');
    }

    main() {
        // A temporary empty object to hold our system
        let outval:any = {};
        let result;

        console.log("Creating FMOD System object\n");

        // Create the system and check the result
        result = this.FMOD.Studio_System_Create(outval);
        this.CHECK_RESULT(result);

        console.log("grabbing system object from temporary and storing it\n");

        // Take out our System object
        this.gSystem = outval.val;

        result = this.gSystem.getCoreSystem(outval);
        this.CHECK_RESULT(result);

        this.gSystemCore = outval.val;
        
        // Optional.  Setting DSP Buffer size can affect latency and stability.
        // Processing is currently done in the main thread so anything lower than 2048 samples can cause stuttering on some devices.
        console.log("set DSP Buffer size.\n");
        result = this.gSystemCore.setDSPBufferSize(2048, 2);
        this.CHECK_RESULT(result);
        
        // Optional.  Set sample rate of mixer to be the same as the OS output rate.
        // This can save CPU time and latency by avoiding the automatic insertion of a resampler at the output stage.
        console.log("Set mixer sample rate");
        result = this.gSystemCore.getDriverInfo(0, null, null, outval, null, null);
        this.CHECK_RESULT(result);
        
        result = this.gSystemCore.setSoftwareFormat(outval.val, this.FMOD.SPEAKERMODE_DEFAULT, 0)
        this.CHECK_RESULT(result);

        console.log("initialize FMOD\n");

        // 1024 virtual channels
        result = this.gSystem.initialize(1024, this.FMOD.STUDIO_INIT_NORMAL, this.FMOD.INIT_NORMAL, null);
        this.CHECK_RESULT(result);
    
        // Starting up your typical JavaScript application loop
        console.log("initialize Application\n");

        
        this.initApplication();

        // Set up iOS/Chrome workaround.  Webaudio is not allowed to start unless screen is touched or button is clicked.
        let resumeAudio = ()=>
        {
            if (!this.gAudioResumed)
            {
                console.log("Resetting audio driver based on user input.");

                result = this.gSystemCore.mixerSuspend();
                this.CHECK_RESULT(result);
                result = this.gSystemCore.mixerResume();
                this.CHECK_RESULT(result);

                this.gAudioResumed = true;


                // FmodManager.getInstance().playOneShot('ChooseLevel');                
            }

        }

        var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        if (iOS)
        {
            window.addEventListener('touchend', resumeAudio, false);
        }
        else
        {            
            document.addEventListener('keydown', resumeAudio);
            document.addEventListener('click', resumeAudio);
        }

        // Set the framerate to 50 frames per second, or 20ms.
        console.log("Start game loop\n");

        window.setInterval(()=>{this.updateApplication()}, 20);

        return this.FMOD.OK;
    }

    // Helper function to load a bank by name.
    loadBank(name: string)
    {
        var bankhandle = {};        
        this.CHECK_RESULT(this.gSystem.loadBankFile("/" + name, this.FMOD.STUDIO_LOAD_BANK_NORMAL, bankhandle) );
    }

    /**
     * Prefix like 'event:/' is not needed.
     * Just use the label in the FMOD browser
     * @param eventName 
     */
    playOneShot(eventName: string) : any{
        eventName = 'event:/' + eventName;
        let desc:any = {};
        let instance: any = {};
        this.CHECK_RESULT(this.gSystem.getEvent(eventName, desc));
        this.CHECK_RESULT(desc.val.createInstance(instance));
        
        instance.val.start();
        instance.val.release();
        return instance;
    }



    
    initInstances() {    
        this.emojiProgressInstance = this.createInstanceByEventName('65537_EmotionAccumulating');
    }

    /**
     * return the instance
     * @param en 
     */
    createInstanceByEventName(en: string) : any {
        let eventName = en
        eventName = 'event:/' + eventName;
        let desc:any = {};
        let instance: any ={};
        this.CHECK_RESULT(this.gSystem.getEvent(eventName, desc));
        this.CHECK_RESULT(desc.val.createInstance(instance));
        return instance;
    }

    playInstance(instance) {
        instance.val.start();
    }

    stopInstance(instance) {
        instance.val.stop(this.FMOD.STUDIO_STOP_IMMEDIATE);
    }



    loopingAmbienceDescription:any = {};
    initApplication() {
        console.log("Loading events\n");    

        for (var count = 0; count < s_banks.length; count++)
        {
            this.loadBank(s_banks[count]);
        }      
        
        
        this.initInstances();

    
        // // Get the Looping Ambience event
        //var loopingAmbienceDescription:any = {};
        // this.CHECK_RESULT( this.gSystem.getEvent("event:/Ambience/Country", this.loopingAmbienceDescription) );
        // // this.loopingAmbienceDescription.val.loadSampleData();
        
        // this.CHECK_RESULT( this.loopingAmbienceDescription.val.createInstance(this.loopingAmbienceInstance) );
        // console.log('test loaded');
        // // Get the 4 Second Surge event
        // var cancelDescription = {};
        // CHECK_RESULT( gSystem.getEvent("event:/UI/Cancel", cancelDescription) );
        
        // CHECK_RESULT( cancelDescription.val.createInstance(cancelInstance) );
        
        // // Get the Explosion event
        // CHECK_RESULT( gSystem.getEvent("event:/Weapons/Explosion", explosionDescription) );
    
        // // Start loading explosion sample data and keep it in memory
        // CHECK_RESULT( explosionDescription.val.loadSampleData() );
    }

    updateApplication() 
    {        
        // Update FMOD
        let result = this.gSystem.update();
        this.CHECK_RESULT(result);
    }

}



let gFmodManager = FmodManager.getInstance();    

