//General constants for calling elements in the HTML
const disMin = document.getElementById("min-dis");
const disSec = document.getElementById("sec-dis");
const button = document.getElementById("timebutton")
const statustext = document.getElementById("statustext")
const clockdisplay = document.getElementById("time-display")
const clockinput = document.getElementById("time-input")

import {trans} from "./text.js";

//Audio
var audio = new Audio('https://cdn.discordapp.com/attachments/1094846471699976263/1258240181757022239/clock-alarm-8761.mp3?ex=668752fc&is=6686017c&hm=e8747124324b47b518782a6208cee22756a74b8d84f3413aff77e953b149d439&')

//Sets variables. Time represents seconds in this case
var timer;
var min;
var sec;
var settime = 1500;
var time = settime;
var state = "start";
var thisInterval;

//Temporary Settings framework
var transonctrl = 'typewriter'

//Sets how to display time
function displayTime(){
    min = ~~(time / 60);
    sec = time % 60;
    disMin.innerHTML = min.toString().padStart(2, '0');
    disSec.innerHTML = sec.toString().padStart(2, '0');
}

//General Functions
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

//Timer Handlier
function timerDone(){
    statustext.innerHTML = "The Timer is Done";
    statustext.style.opacity = '1';
    button.innerHTML = "Start";
    time = settime;
    clearInterval(thisInterval);
    isRunning = false;
    console.log(time);
    audio.play();
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

//Start of the program
displayTime()
button.dataset.state = 'start'
console.log(button.dataset)
//Handles when the button is pressed
button.addEventListener("click", function(){
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
    console.log("Timer is in " + state + " mode")
})

//Handles when a key is pressed
document.addEventListener('keydown', (e) => {
    if(e.code === "ControlLeft" && !e.repeat && button.dataset.intrans === "none" && (state == 'running' || state == 'paused')){
        //If the button is transitioning inversely, will prevent a conflicting normal transition from happening        
        if (button.dataset.intrans !== "inverse")
        {
            if (button.innerHTML == "Stop")
            {
                button.dataset.intrans = 'inverse';
                trans.typewrite(button.innerHTML, "Pause", .1, button);
            }
            else
            {
                button.dataset.intrans = 'forward';
                trans.typewrite(button.innerHTML, "Stop", .1, button);
            }
        }
    }
});

//Handles whena  key is released
document.addEventListener('keyup', (e) => {
    console.log('a');
    if(e.code === "ControlLeft" && button.dataset.intrans === "none" && (state == 'running' || state == 'paused')){
        //If the button is transitioning normally, will prevent a conflicting inverse transition from happening
        if (button.dataset.intrans !== "forward")
        {
            button.dataset.intrans = 'inverse'
            if(state == 'running')
            {
                trans.typewrite(button.innerHTML, "Pause", .1, button);
            }
            else if(state == 'paused')
            {
                trans.typewrite(button.innerHTML, "Unpause", .1, button);
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