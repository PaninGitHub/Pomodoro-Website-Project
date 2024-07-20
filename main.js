//General constants for calling elements in the HTML
const disMin = document.getElementById("min-dis");
const disSec = document.getElementById("sec-dis");
const inSec = document.getElementById("sec-in")
const inMin = document.getElementById("min-in")
const inHr = document.getElementById("hour-in")
const button = document.getElementById("timebutton");
const statustext = document.getElementById("statustext");
const clockdisplay = document.getElementById("time-display");
const clockinput = document.getElementById("time-input");
const pomodots = document.getElementById("pomodots");
const pdot = pomodots.children[0]
const timerring = new Audio('../audio/clock-alarm-8761.mp3');
var pdotscur;

//Booleans
var isCtrlUp = false;


//Imports
import {trans} from "./transitions.js";
import {s} from "./config.js"

//Sets variables. Time represents seconds in this case
var min;
var sec;
var settime = 0;
var time = settime;
var state = "start";
var thisInterval;
var this_cycle = [];

//Functions
function startOfTimer(){
    updateCycle()
    console.log(s.wb_dur[this_cycle[0]])
    if(s.wb_dur[this_cycle[0]] != undefined){
        settime = s.wb_dur[this_cycle[0]]
    }
    time = settime
    displayTime()
    setPDots()
}

function importColorScheme(){
    var style = document.createElement('style')
    style.id = "styleid"
    style.innerHTML = "ok"
}

function updateCycle(){
    this_cycle = [];
    for(let i = 0; i < s.amtOfPDots; i++){
        for(let j = 0; j < s.wb_cycle.length; j++){
            this_cycle.push(s.wb_cycle[j])
        }
    }
}

function updateDots(){
    for(let i = 0; i < amtOfPDots; i++){
        
    }
}   

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
            //Converts string input to integer
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
    if(pomodots.children.length != 0){
        pomodots.removeChild(pomodots.children[0]);
        this_cycle.splice(0, 1)
        time = 0;
        displayTime()
        pdotscur -= 1
        console.log(this_cycle.length)
        clearInterval(thisInterval);
    }
    else{
        time = settime;
        displayTime()
        clearInterval(thisInterval);
    }
    if(this_cycle.length <= 0){
        button.innerHTML = "Restart"
        state = "done"
    }
}

function setPDots(){
    pdotscur = s.amtOfPDots;
    for(let i = 0; i < s.amtOfPDots; i++){
        s.wb_cycle.forEach(element => {
            if(s.reg_peroids.includes(element)){
                //The dots only clone is a clone is made in the for loop;
                //If you put the below line outside the for loop, it won't work
                let pdotClone = pdot.cloneNode(true);
                pdotClone.classList.add(element)
                pomodots.appendChild(pdotClone);  
            }    
            else{
                console.log(`Error: Peroid ${element} is not recongized` )
            }
        });
    }
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
    if (button.innerHTML == 'Stop')
    {
        state = 'start'
        clearInterval(thisInterval);
        time = settime;
        displayTime();
        trans.static("Start", button);
    }
    else if (state == 'start' || state == 'paused')
    {
        state = 'running';
        trans.static("Pause", button);
        runTimer();
    }
    else if (state == 'running')
    {
        state = 'paused'
        trans.static("Unpause", button)
        clearInterval(thisInterval);
    }
    else if (state == 'input')
    {
        state = 'start'
        trans.static("Start", button);
        setTime();
        clockdisplay.classList.replace("time-display-hide", "time-display-show")
        clockinput.classList.replace("time-input-show", "time-input-hide")
    }
    else if (state == 'done')
    {
        state = 'start'
        clearInterval(thisInterval);
        startOfTimer()
        button.dataset.state = 'start'
        trans.static("Start", button);
    }
    console.log("Timer is in " + state + " mode")
}


//Start of the program
/*So exciting!!
/* */

//Shows all dots
startOfTimer()
pomodots.removeChild(pomodots.children[0])
button.dataset.state = 'start'
console.log(pomodots.children.length)

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
          if(state == 'running')
          {
            trans.static("Pause", button);
          } 
          if(state == 'paused')
          {
            trans.static("Unpause", button);
          } 
        }
    }
})

//Changing time in clock
clockdisplay.addEventListener("click", function(){
    inSec.value = (time % 60).toString().padStart(2, '0');
    inMin.value = (~~(time % 3600 / 60)).toString().padStart(2, '0');
    inHr.value = (~~(time / 3600)).toString().padStart(2, '0');
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