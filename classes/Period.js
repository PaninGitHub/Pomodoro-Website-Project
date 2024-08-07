//Scrapped till later. No use of them now.

export class Period {
    constructor(name, label, duration, color, description = "", sound = "../assets/audio/clock-alarm-8761.mp3", notificationWhenFinished = "true"){
        if(name === undefined || duration === undefined){
            throw new Error(`Either the name and/or duration wasn't given when constructing this peroid`)
        }
        this.name = name;
        this.label = label; //Used for abberiviations should I don't gotta type out "sHoRt bReAk" every time.
        this.duration = duration;
        this.color = color;
        this.description = description;
        this.sound = sound;
        this.dot_id = "";
        this.isShown = true;
        this.notificationWhenFinished = notificationWhenFinished;
        this.shouldAutostart = false;
    }
    playSound(){
        let audio = ''
        if(this.sound.charAt(0) == ".")
            {
                audio = new Audio(this.sound);
            }
            else
            {
                audio = new Audio(this.sound);
            }
            console.log(audio)
        audio.play()
    }
    pushNotification(globalSetting){
        if((this.notificationWhenFinished && globalSetting == 'default') || (!this.notificationWhenFinished && globalSetting == 'always')){
            if(Notification.permission == 'granted')
                {
                new Notification(`Your timer is done!`, 
                    {
                        body: `${this.name} is Completed`,
                    }
                )
            }
            else
            {
                console.log(`period ${this.dot_id} could not push notfication due to blockage`)
            }
        }
    }
    updatePeriod(prop, value){
        //Checks if color is valid
        if(prop = 'color'){
            let reg = /^#([0-9a-f]{3}){1,2}$/i;
            if(reg.test(value)){
                this.color = value;
            } else {
                throw new Error(`Error: The inputted value ${value} for ${prop} is not in correct format.`)
            }
            return;
        }
        this.keys(prop) = value
    }
}
