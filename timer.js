//Sets constants for calling elements in the HTML
const disMin = document.getElementById("min-dis");
const disSec = document.getElementById("sec-dis");
const button = document.getElementById("timebutton")
const statustext = document.getElementById("statustext")
const clockdisplay = document.getElementById("time-display")
const clockinput = document.getElementById("time-input")

//Audio
var audio = new Audio('https://cdn.discordapp.com/attachments/1094846471699976263/1258240181757022239/clock-alarm-8761.mp3?ex=668752fc&is=6686017c&hm=e8747124324b47b518782a6208cee22756a74b8d84f3413aff77e953b149d439&')

//Sets variables. Time represents seconds in this case
var timer;
var min;
var sec;
var settime = 3;
var time = settime;
var isRunning = false;
var thisInterval;



//Sets how to display time
function displayTime(){
    min = ~~(time / 60);
    sec = time % 60;
    disMin.innerHTML = min.toString().padStart(2, '0');
    disSec.innerHTML = sec.toString().padStart(2, '0');
}

//Timer Handlier
function timerDone(){
    statustext.innerHTML = "The Timer is Done";
    statustext.style.opacity = '1'
    button.innerHTML = "Start";
    time = settime;
    clearInterval(thisInterval);
    isRunning = false;
    console.log(time)
    audio.play();
}

function runTimer(){
    thisInterval = setInterval(function() {
        if (time < 1){
            timerDone()
            return
        }
            time -= 1;
            displayTime();
    }, 1000)
}

//Event Handlers
displayTime()
button.addEventListener("click", function(){
    if (isRunning == false){
        button.innerHTML = "Pause";
        isRunning = true;
        runTimer()
    }
    else if (isRunning == true){
        button.innerHTML = "Unpause";
        isRunning = false; 
        clearInterval(thisInterval);
    }
})

//Changing time in clock
clockdisplay.addEventListener("click", function(){
    clockdisplay.classList.remove("time-display-show")
    clockdisplay.classList.add("time-display-hide")
    clockinput.classList.remove("time-input-hide")
    clockinput.classList.add("time-input-show")
    //If the clock was running when clicked, it will pause it
    if (isRunning == true){
        isRunning = false; 
        clearInterval(thisInterval);
    }
    button.innerHTML = "Enter";
})

//Enforces a 2-digit limit when changing time in the clock
for(sel of document.getElementsByClassName("Tin")){
    sel.addEventListener('input', function(){
        //The line below take the whole string, selects every non-number, and replaces it with an empty string. Love you ChatGPT for explaining it :))
        this.value = this.value.replace(/\D/g, '');
        this.value = this.value.slice(0, 2);
})
}