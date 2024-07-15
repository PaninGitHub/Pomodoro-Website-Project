//General constants for calling elements in the HTML
const disMin = document.getElementById("min-dis");
const disSec = document.getElementById("sec-dis");
const button = document.getElementById("timebutton");
const statustext = document.getElementById("statustext");
const clockdisplay = document.getElementById("time-display");
const clockinput = document.getElementById("time-input");
const pomodots = document.getElementById("pomodots");
const pdot = pomodots.children[0]
var pdotscur;

//Imports
import {trans} from "./transitions.js";
import {s} from "./config.js"

//Booleans
var isCtrlUp = false;

//Audio
var timerring = new Audio('../audio/clock-alarm-8761.mp3')

//Sets variables. Time represents seconds in this case
var timer;
var min;
var sec;
var settime = 1500;
var time = settime;
var state = "start";
var thisInterval;

//Functions
function displayTime(){
    min = ~~(time / 60);
    sec = time % 60;
    disMin.innerHTML = min.toString().padStart(2, '0');
    disSec.innerHTML = sec.toString().padStart(2, '0');
}

function setTime(){
    let thisHour = Number(document.getElementById("hour-in").value);
    let thisMin = Number(document.getElementById("min-in").value);
    let thisSec = Number(document.getElementById("sec-in").value);
    [thisSec, thisMin, thisHour].forEach((element) => {
        if(element == ""){
            element = 0;
        }
        else{
            element *= 1;
        }
    })
    settime = thisSec + thisMin * 60 + thisHour * 3600;
    time = settime;
    displayTime();
    console.log("Set time to " + time);
}

function timerDone(){
    timerring.play()
    statustext.style.opacity = '1';
    state = "start"
    button.innerHTML = "Start";
    time = settime;
    displayTime()
    clearInterval(thisInterval);
    pomodots.removeChild(pomodots.children[0]);
    pdotscur -= 1
    console.log(pdotscur)
    if(pdotscur <= 0){
        button.innerHTML = "Restart"
        state = "done"
    }
}

function setPDots(){
    pdotscur = s.amtOfPDots;
    for(let i = 0; i < s.amtOfPDots; i++){
        //The dots only clone is a clone is made in the for loop;
        //If you put the below line outside the for loop, it won't work
        //Dumbass
        let pdotClone = pdot.cloneNode(true);
        pomodots.appendChild(pdotClone);      
    }
    pomodots.removeChild(pomodots.children[0])
}

function runTimer(){
    thisInterval = setInterval(function() {
        if (time < 1){
            timerDone();
            return;
        }
            time -= 1;
            displayTime();
    }, 1000)
}

//Made this a seperate function so that I don't have to copy and paste code 
//Transitions between states
function checkState(){
    if (button.innerHTML == 'Stop'){
        state = 'start'
        clearInterval(thisInterval);
        time = settime;
        displayTime();
        trans.static("Start", button);
    }
    else if (state == 'start' || state == 'paused'){
        state = 'running';
        trans.static("Pause", button);
        runTimer();
    }
    else if (state == 'running'){
        state = 'paused'
        trans.static("Unpause", button)
        clearInterval(thisInterval);
    }
    else if (state == 'input'){
        state = 'start'
        trans.static("Start", button);
        setTime();
        clockdisplay.classList.replace("time-display-hide", "time-display-show")
        clockinput.classList.replace("time-input-show", "time-input-hide")
    }
    else if (state == 'done'){
        state = 'start'
        clearInterval(thisInterval);
        time = settime;
        setPDots()
        displayTime()
        button.dataset.state = 'start'
        trans.static("Start", button);
    }
    console.log("Timer is in " + state + " mode")
}


//Start of the program
/*So exciting!!
/* */

//Shows all dots
displayTime()
setPDots()
button.dataset.state = 'start'


//Handles when the button is pressed
button.addEventListener("click", function(){
    checkState()
})

//Handles when a key is pressed
document.addEventListener('keydown', (e) => {
    if(e.code === "ControlLeft")
    {
        isCtrlUp = true;
        if(!e.repeat && button.dataset.intrans === "none" && (state == 'running' || state == 'paused'))
        {
            trans.static('Stop', button);
        }
    }
    else if((e.code === "Enter" || e.code === "Space") && !e.repeat){
        checkState();
    }
});

//Handles whena  key is released
document.addEventListener('keyup', (e) => {
    console.log('a');
    if(e.code === "ControlLeft")
    {
        isCtrlUp = false;
        if(button.dataset.intrans === "none" && (state == 'running' || state == 'paused')){
          if(state == 'running'){
            trans.static("Pause", button);
          } 
          if(state == 'paused'){
            trans.static("Unpause", button);
          } 
        }
    }
})

//Changing time in clock
clockdisplay.addEventListener("click", function(){
    clockdisplay.classList.replace("time-display-show", "time-display-hide")
    clockinput.classList.replace("time-input-hide", "time-input-show")
    //If the clock was running when clicked, it will pause it
    if (state == 'running'){
        clearInterval(thisInterval);
    }
    state = 'input'
    console.log("Inputting time")
    button.innerHTML = "Enter";
})

//Enforces a 2-digit limit when changing time in the clock
for(let sel of document.getElementsByClassName("Tin")){
    sel.addEventListener('input', function(){
        //The line below take the whole string, selects every non-number, and replaces it with an empty string. Love you ChatGPT for explaining it :))
        this.value = this.value.replace(/\D/g, '');
        this.value = this.value.slice(0, 2);
})
}