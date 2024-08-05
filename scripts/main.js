//General constants for calling elements in the HTML
const disMin = document.getElementById("min-dis");
const disSec = document.getElementById("sec-dis");
const inSec = document.getElementById("sec-in")
const inMin = document.getElementById("min-in")
const inHr = document.getElementById("hour-in")
const estMin = document.getElementById("min-est")
const estHr = document.getElementById("hr-est")
const button = document.getElementById("timebutton");
const statustext = document.getElementById("statustext");
const clockdisplay = document.getElementById("time-display");
const clockinput = document.getElementById("time-input");
const estdisplay = document.getElementById("time-est-div");
const pomodots = document.getElementById("pomodots");
const pdot = pomodots.children[0]
const tps_display = document.getElementById("s_p_option") //Stands for time period settings
const periodtitle = document.getElementById('periodtitle')
const settings_icon_background = document.getElementById('settings_icon_background')
const settings_icon = document.getElementById('settings_icon')
const settings_aside = document.getElementById('settings_aside')
const settings_set_time_dur = document.getElementById('s_p_1')

const displayed_settings = document.querySelectorAll('.s_dropdown, .s_input, .s_toggle__input, .s_p_dropdown')
//const jsonData = require('./configs/default-config.json')
var buttonclickaudio;
var tps_selected = ""


//Booleans
var isCtrlUp = false;
var isShiftUp = false;
var isEnterUp = false;

//Imports
import { Period } from "../classes/Period.js";
import {trans} from "./transitions.js";

//Sets variables. Time represents seconds in this case
var min;
var sec;
var settime = 0;
var time = settime;
var state = "start";
var thisInterval;
var this_cycle = [];
var this_periodlist = [];
var periods = [];
var registered_periods = [];
var c = '';


//Functions

function askNotificationPermission() {
    // Check if the browser supports notifications
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications.");
      return;
    }
    Notification.requestPermission().then((result) => {
        console.log(`Notifications are ${result}`);
      });
}   

function addPeriod(l){
    let period = ""
    for(let i = 0; i < periods.length; i++){
        if(periods[i].label == l){
            period = periods[i]
            break;
        }
    }
    //Makes sure that the period is skipped if insufficent infomation is given
    try {
        this_periodlist.push(
            new Period(
                period.name,
                period.label,
                period.duration,
                period.color,
                period.description,
                period.sound,
                period.notificationWhenFinished
            )
        )
    } catch (error) {
        console.error(error + `: ${period}`)
    }
}

function removePeriod(l){
    pomodots.removeChild(pomodots.children[l]);
    this_periodlist;
    if(pomodots.children.length > 0 && !pomodots.children[0].classList.contains('shadow')){
        pomodots.children[0].classList.add('shadow');
    }
    this_periodlist.splice(0, 1);
}

function startOfTimer(){
    //Removes warning when allowed to use pomodoro feature
    document.getElementById("general_settings_warning").innerHTML = ``
    //Handles cases where the mode uses the pomodoro feature but the cycle is empty
    if(c.pomodoro_mode == "classic" || c.pomodoro_mode == "overflow"){
        try{
            if(this_cycle == undefined){
                throw new Error("Setting 'cycle' is undefined when attempting to start the timer. Defaulting to timer mode")
            }
            else if(this_cycle.length === 0){
                throw new Error("Setting 'cycle' is empty when attempting to start the timer. Defaulting to timer mode")
            }
        } catch (error) {
            console.error(error)
            c.pomodoro_mode = "timer"
            time = 0;
            document.getElementById("general_settings_warning").innerHTML = `Can't change to the selected mode: No periods were given`
            updateSettings()
        }
    }
    //Makes sure that the input screen is still not shown is user was on it when switched
    if(state == "input"){
        clockdisplay.classList.replace("time-display-hide", "time-display-show")
        clockinput.classList.replace("time-input-show", "time-input-hide")
    }
    clearInterval(thisInterval)
    if(this_periodlist.length > 0){
       this_periodlist = []
    }
    state = 'start'
    button.dataset.state = 'start'
    trans.static("Start", button);
    setPeriods(c.pomodoro_mode)
    time = settime
    if(c.pomodoro_mode == "stopwatch"){
        time = 0
    }
    displayTime()
}

function registerPeriods(){
    registered_periods = [];
    this_periodlist.forEach((period) => {
        if(!registered_periods.includes(period.label)){
            registered_periods.push(period.label)
        }
    })
}

function populateCyclePresets(){
    c.cycle_presets.forEach((pre) => {
        const node = document.createElement('option')
        node.textContent = pre.name
        node.value = pre.name
        document.getElementById("cycle_presets").appendChild(node)
    })
}

function setCyclePreset(pre){
    c.selected_cycle_preset = pre
    if(pre === 'no_preset'){
        this_cycle = c.cycle
        periods = JSON.parse(JSON.stringify(c.periods))
    }
    else{
        c.cycle_presets.forEach((p) => {
            if(p.name == pre){
                this_cycle = p.cycle
                //Fills in preset infomation to the period list on the website
                matchPeriodProperties(periods, p.periods) 
                startOfTimer()
            }
        })
    }
    startOfTimer()
    return;
}

function matchPeriodProperties(toReplace, newlist){
    toReplace.forEach(o => {
        newlist.forEach(n => {
            if(o.label == n.label){
                for(let prop in o){
                    if(o.hasOwnProperty(prop) && n.hasOwnProperty(prop)){
                        o[prop] = n[prop]
                    }
                }
            }
        })
    });
}

function updateCycle(){
    this_periodlist = [];
    for(let i = 0; i < c.amtOfCycles; i++){
        for(let j = 0; j < this_cycle.length; j++){
            if(isMultiCycle(this_cycle[j])){
                
            }
            this_periodlist.push(this_cycle[j])
        }
    }
}

function updateDots(restart){
    let max_periods = c.max_periods
    if(restart){
        while(pomodots.children.length > 0){
            pomodots.removeChild(pomodots.children[0])
        }
        this_periodlist.forEach((dot) => {
            appendDot(dot)
        })
        if(pomodots.children.length > 0){
            pomodots.children[0].classList.add('shadow');
        }
        return;
    }
    else{
        //Makes sure that in Overflow mode another cycle iteration is added if the periods created are less that what is requested to be showen
        if(c.pomodoro_mode == "overflow"){
            max_periods = lengthOfCycle(this_cycle)
            if(this_periodlist.length < max_periods){
                appendCycle(this_cycle)
            }
        }
        //Checks whether any new dots were added
        if(pomodots.children.length < this_periodlist.length){
            for(let i = pomodots.children.length; i < this_periodlist.length; i++){
                appendDot(this_periodlist[i])
            }
        }
        //Shows any new dots
        if(pomodots.children.length > max_periods){
            for(let i = 0; i < max_periods; i++)
            {
                if(pomodots.children[i].classList.contains('hide'))
                {
                    pomodots.children[i].classList.remove('hide')
                }
            }
            for(let i = max_periods; i < pomodots.children.length; i++){
                if(!pomodots.children[i].classList.contains('hide'))
                {
                    pomodots.children[i].classList.add('hide')
                }
            }
        }   
        else {
            for(let i = 0; i < pomodots.children.length; i++)
                {
                    if(pomodots.children[i].classList.contains('hide'))
                    {
                        pomodots.children[i].classList.remove('hide')
                    }
                }
        }
    }
    //Just in case there is no pomodots
    try{
        const thisChild = pomodots.children[0]
        if(!thisChild.classList.contains('shadow') && c.glowFirstElement){
           thisChild.classList.add('shadow');
           //thisChild.style.boxShadow = `0px 0px 4px 4px ${getComputedStyle(thisChild).backgroundColor}`;
        }
        else if(pomodots.children[0].classList.contains('shadow') && !c.glowFirstElement){
            pomodots.children[0].classList.remove('shadow')
        }
    } catch (error){
        console.error(error)
    }
}   

function displayTime(){
    min = ~~(time / 60);
    sec = time % 60;
    disMin.innerHTML = min.toString().padStart(2, '0');
    disSec.innerHTML = sec.toString().padStart(2, '0');
    updateTimeEstimate()
}

function updateDisplayOfSettings(settings){
    settings.forEach((ele) => {
        switch(ele.id){
            case 's_time_est_toggle':
                ele.checked = c.glowFirstElement
                break;
            case 's_glow_first_toggle':
                ele.checked = c.showTimeEstimated
                break;
            case 's_strch_bkground':
                ele.value = c.stretch_background_image
                break;
            case 's_img_url':
                ele.value = c.background_image
                break
            case 's_time_est_format':
                ele.value = c.est_time_format
                break;
            case 's_notif_all':
                ele.value = c.notificationForAll
                break;
            case 's_timer_mode':
                ele.value = c.pomodoro_mode
                break;
            case 's_max_dots_shown':
                ele.value = c.max_periods
                break;
        }
    })    
}
function initalizeSettings(){
    updateDisplayOfSettings(displayed_settings)  
    populateCyclePresets()
    stretchBackgroundImage(c.stretch_background_image)
    registered_periods.forEach((element) => {
        let period = getPeriodByLabel(element)
        let tpsClone = tps_display.cloneNode(true);
        tpsClone.value = element
        tpsClone.innerHTML = period.name
        s_p_dropdown.appendChild(tpsClone); 
    }) 
}

function getPeriodByLabel(value){
    for(let i = 0; i < periods.length; i++){
        if(periods[i].label == value){
            return(periods[i])
            break;
        }
    }
}

function updateSettings(){
    updateDisplayOfSettings(displayed_settings) 
    if(settings_set_time_dur.value != ""){
        //Change HTML based on settings
    }
}

function updateTimeEstimate(){
    if(c.showTimeEstimated && estdisplay.classList.contains('hide')){
        estdisplay.classList.remove('hide')
    }
    else if(!c.showTimeEstimated && !estdisplay.classList.contains('hide')){
        estdisplay.classList.add('hide')
    }
    let now = new Date();
    let hr = now.getHours();
    let min = now.getMinutes();
    let sec = now.getSeconds();
    let timeest = hr * 3600 + min * 60 + sec + time;
    for(let i = 1; i < this_periodlist.length; i++){
        timeest += this_periodlist[i].duration
    }
    if(c.est_time_format == "24-hr"){
        estHr.innerHTML = ~~(timeest / 3600).toString().padStart(2, '0');
        estMin.innerHTML = ~~((timeest % 3600) / 60).toString().padStart(2, '0');
    }
    else{
        estHr.innerHTML = ~~((timeest % 43200) / 3600)
        estMin.innerHTML = ~~((timeest % 3600) / 60)
        if(~~(timeest / 43200) % 2 == 0){
            if(~~(timeest / 3600) % 24 == 0){
                estHr.innerHTML = 12
            }
            estMin.innerHTML = (estMin.innerHTML.toString().padStart(2, '0') + " AM");
        }
        else{
            estMin.innerHTML = (estMin.innerHTML.toString().padStart(2, '0') + " PM");
            if(~~(timeest / 3600) % 24 == 12){
                estHr.innerHTML = 12
            }
        }
    }
    //Idk if Javascript will delete these element, but ima do it manually just to avoid any memory leaks
    now, hr, min, sec, timeest = null;

}

function isValidURL(url) {
    try {
        const urlObject = new URL(url);
        // Additional checks, if necessary.
        return true;
    } catch (error) {
        return false;
    }
}

function uploadBackgroundIMG(url){
    if(isValidURL(c.background_image)){
        document.getElementById("body").style.backgroundImage = `url(${url})`
        if(document.getElementById('background').classList.contains("hide")){
            document.getElementById('background').classList.remove("hide")
        }
    }
    else{
        console.log("Failed to load background image: URL is invalid")
    }
}

function stretchBackgroundImage(set){
   switch (set){
        case "default": 
            document.getElementById("body").style.backgroundSize = "auto auto"
            break;
        case "stretch":
            document.getElementById("body").style.backgroundSize = "100% 100%"
            break;
        case "fit":
            document.getElementById("body").style.backgroundSize = "cover"
            break;
    }
}

function setTimeByInput(){
    let thisHour = Number(inHr.value);
    let thisMin = Number(inMin.value);
    let thisSec = Number(inSec.value);
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

function timerDone(skip){
    let tp = this_periodlist[0] //tp -> This Period
    if(c.pomodoro_mode == "timer"){
        time = 0
        let i = new Audio(c.default_alarm_sound)
        i.play()
        clearInterval(thisInterval);
        new Notification(`Your timer is done!`)
        button.innerHTML = "Restart"
        periodtitle.classList.add('hide')
        state = "done"
        displayTime()
        return;
    }
    if(!skip){
        tp.playSound();
        tp.pushNotification(c.notificationForAll)
    }
    removePeriod(0)
    tp = this_periodlist[0]
    statustext.style.opacity = '1';
    state = "start"
    button.innerHTML = "Start";
    if(pomodots.children.length != 0){
        //Note: Need to possibly add error handlier if it calls the wrong period or smth.
        if(tp.duration != undefined){
            settime = tp.duration
            time = settime
        } else {
            console.log(`Error: Duration is invalid for this period ${this_periodlist[0].name}`)
        }
        periodtitle.innerHTML = tp.name;
        displayTime()
        clearInterval(thisInterval);
        updateDots(false)
    }
    else{
        time = settime;
        displayTime()
        clearInterval(thisInterval);
    }
    if(this_periodlist.length <= 0){
        button.innerHTML = "Restart"
        periodtitle.classList.add('hide')
        state = "done"
    }
}

function appendDot(dot){
    //The dots only clone is a clone is made in the for loop;
    //If you put the below line outside the for loop, it won't work  
    if(registered_periods.includes(dot.label)){
        let pdotClone = pdot.cloneNode(true);
        pdotClone.classList.add(dot.label)
        pdotClone.id = `pdot${pomodots.children.length + 1}`
        dot.dot_id = `pdot${pomodots.children.length + 1}`
        pdotClone.style.setProperty('--bg-color', `${dot.color}`)
        pdotClone.style.setProperty('--bg-color-shadow', `${dot.color}8f`)
        if(pomodots.children.length + 1> c.max_periods){
            pdotClone.classList.add('hide')
        }
        pomodots.appendChild(pdotClone);  
    }
}

function isMultiCycle(element){
    let isMulti = false;
    if(element.charAt(element.length - 1) == "x" && element.length > 1){
        isMulti = true;
        for(let i = 0; i < element.length - 1; i++)
        {
            let charCode = element.charCodeAt(i);
            if(!(charCode >= 48 && charCode <= 57))
            {
                isMulti = false;
                break;
            }
        }   
    }
    return(isMulti)
}

//Returns lenght of Cycle
function lengthOfCycle(cycle){
    let l = 0
    let checkpoint = 0;
    cycle.forEach(element => 
    {
        l += 1
        //Checks for multipltive cycles ("3x", "10x", "6x", etc.)
        if(isMultiCycle(element))
        {
            //Adds in amt. of periods times it's multiplitive cycle
            l += ((Number(element.substring(0, element.length - 1)) - 1) * (cycle.indexOf(element) - checkpoint)) - 1
            checkpoint = this_cycle.indexOf(element) + 1;
            return;
        }
    });
    return(l)
}

function appendCycle(cycle){
    let checkpoint = 0;
    cycle.forEach(element => 
        {
            //Checks for multipltive cycles ("3x", "10x", "6x", etc.)
            if(isMultiCycle(element))
            {
                for(let j = 0; j < Number(element.substring(0, element.length - 1) - 1); j++)
                {
                    for(let k = checkpoint; k < cycle.indexOf(element); k++)
                    {
                        addPeriod(cycle[k])
                    }
                }
                checkpoint = cycle.indexOf(element) + 1;
                return;
            }
            addPeriod(element)
        });
}

function setPeriods(mode){
    this_periodlist = [];
    let this_amtOfCycles = c.amtOfCycles
    //Sets time at the beginning
    if(mode == "timer" || mode == "stopwatch"){
        updateDots(true)
        return
    }
    else if (mode == "overflow"){
        this_amtOfCycles = 1;
    }
    //Pending Cycle
    for(let i = 0; i < this_amtOfCycles; i++)
    {
        appendCycle(this_cycle)
    }
    let tp = this_periodlist[0] //tp -> This Period
    if(tp.duration != undefined){
        settime = tp.duration
    }
    if(this_periodlist.length >= 1)
    {
        periodtitle.classList.add('show')
        periodtitle.innerHTML = tp.name
    }
    registerPeriods()
    updateDots(true)
}

function runTimer(){
    thisInterval = setInterval(function() {
        if (time <= 1){
            timerDone(false);
            return;
        }
            time -= 1;
            displayTime();
    }, 1000)
}

function runStopwatch(){
    thisInterval = setInterval(function() {
            time += 1;
            displayTime();
    }, 1000)
}

//Made this a seperate function so that I don't have to copy and paste code 
//Transitions between states
function checkState(){
    if (button.innerHTML == 'Stop')
    {
        if(c.pomodoro_mode == "stopwatch"){
            settime = 0
        }
        state = 'start'
        clearInterval(thisInterval);
        time = settime;
        displayTime();
        trans.static("Start", button);
    }
    else if (button.innerHTML == 'Skip')
    {
        timerDone(true)
    }
    else if (state == 'start' || state == 'paused')
    {
        state = 'running';
        trans.static("Pause", button);
        if(c.pomodoro_mode == "stopwatch"){
            runStopwatch();
        }
        else{
            runTimer();
        }
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
        setTimeByInput();
        clockdisplay.classList.replace("time-display-hide", "time-display-show")
        clockinput.classList.replace("time-input-show", "time-input-hide")
    }
    else if (state == 'done')
    {
        startOfTimer()
        button.dataset.state = 'start'
        trans.static("Start", button);
    }
    console.log("Timer is in " + state + " mode")
}


//Start of the program
/*So exciting!!
/* */

//Loads JSON


fetch(`../data/dev-configs/test-config.json`).then(res => res.json()).then(data => {
    c = data;
    periods = JSON.parse(JSON.stringify(c.periods))
    this_cycle = JSON.parse(JSON.stringify(c.cycle))
    console.log(c.cycle_presets)
    buttonclickaudio = new Audio(c.default_button_press_sound);
    uploadBackgroundIMG(c.background_image)
    askNotificationPermission()
    pomodots.removeChild(pomodots.children[0]);
    startOfTimer();
    button.dataset.state = 'start';
    console.log(`Loaded in ${this_periodlist.length} periods`)
    setInterval(updateTimeEstimate, 1000)
    initalizeSettings()
}).catch(error => {
    // Handle any errors that occur during the fetch
    console.error('Error fetching or parsing data:', error);
});


//Handles when the button is pressed
button.addEventListener("click", function(){
    buttonclickaudio.play()
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
    else if(e.code === "ShiftLeft"){
        if(!(c.pomodoro_mode == "timer" || c.pomodoro_mode == "stopwatch"))
        {
                isShiftUp = true;
                if(!e.repeat && button.dataset.intrans === "none" && (state == 'running' || state == 'paused'))
                {
                    trans.static('Skip', button);
                }
                else if((e.code === "Space") && !e.repeat)
                {
                        buttonclickaudio.play()
                        checkState();
                }
        }
    }
    else if(e.code === "Enter"){
        if(state == "input"){
            checkState()
        }
    }
});

//Handles when a key is released
document.addEventListener('keyup', (e) => {
    if(e.code === "ControlLeft")
    {
        isCtrlUp = false;
    }
    else if(e.code === "ShiftLeft")
    {
        isShiftUp = false;
    }
    else
    {
        return;
    }
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
})

//Handles when settings button is clicked
settings_icon_background.addEventListener('click', function(){
    //Checks classes of the setting background to determine if settings is shown or not
    [settings_icon, 
    settings_icon_background, 
    settings_aside].forEach((element) => {
    if(!settings_icon_background.classList.contains("settings_shown")){
        element.classList.add("settings_shown")
    }
    else{
        element.classList.remove("settings_shown")
    }
}   )
    
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

////Event Handler for Elements
//Settings


displayed_settings.forEach((ele) => {
    ele.addEventListener('change', function(){
        switch(ele.id)
        {
            //General Settings
            case 's_time_est_toggle':
                c.showTimeEstimated = this.checked;
                updateTimeEstimate();
                break;
            case 's_time_est_format':
                c.est_time_format = this.value;
                updateTimeEstimate();
                break;
            case 's_glow_first_toggle':
                c.glowFirstElement = this.checked;
                updateDots(false)
                break;
            case 's_notif_all':
                c.notificationForAll = this.value
                break;
            case 's_strch_bkground':
                c.stretch_background_image = this.value
                stretchBackgroundImage(c.stretch_background_image)
                break;
            case 's_url_bkground_img':
                c.background_image = this.value
                uploadBackgroundIMG(c.background_image)   
                break; 
            case 's_max_dots_shown':
                c.max_periods = this.value
                updateDots(false)
                break; 
            case 's_timer_mode':
                c.pomodoro_mode = this.value
                startOfTimer()
            //Individual Periods 
            case 's_p_dropdown':
                try{
                document.getElementById("spdot").style.backgroundColor = getPeriodByLabel(this.value).color;
                tps_selected = getPeriodByLabel(this.value);
                settings_set_time_dur.value = tps_selected.duration;
                } catch(error){
                    console.log(`${error} => Caused when element ${ele.id} was changed`)
                }
                break;
            case 'cycle_presets':
                setCyclePreset(this.value)
        }
    })
})

document.getElementById("help_icon").addEventListener('mouseover', function(){

})

document.getElementById("help_icon").addEventListener('mouseleave', function(){
    
})