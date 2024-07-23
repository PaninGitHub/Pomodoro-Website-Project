//Scrapped till later. No use of them now.

export class Peroid {
    constructor(name, label, duration, color, description = "", sound = "../audio/clock-alarm-8761.mp3"){
        this.name = name;
        this.label = label; //Used for abberiviations should I don't gotta type out "sHoRt bReAk" every time.
        this.duration = duration;
        this.color = color;
        this.description = description;
        this.sound = sound;
        this.dot_id = "";
        this.isShown = true;
        this.pushNotifications = true;
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
}
