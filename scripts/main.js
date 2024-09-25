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
const displayed_settings = document.querySelectorAll('.s_dropdown, .s_input, .s_toggle__input, .s_p_dropdown') //All of the input elements for settings
//const jsonData = require('./configs/default-config.json')
var buttonclickaudio;
var tps_selected = ""

//Booleans
var isCtrlUp = false;
var isShiftUp = false;

//Imports
import { Period } from "../classes/Period.js";
import {trans} from "./transitions.js";

//Testing purposes 
const token = 'devmode'

//Sets variables. Time represents seconds in this case
//* this_cycle -> Represents the cycle that is currently being used as of the moment from the config
//* this_periodlist -> Represents the list of periods being used in this cycle
//* periods -> Stores the presets of each period type from the config
//* registered_periods -> Stores each type of period that is registered in the system
//* c -> Represents the loaded config

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
const intervalinms = 250


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

/** 
 * Adds a Period object to an array by fetching the config by it's label
 * @param {string} l - The label of the Period object
 * 
*/
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

/** 
 * Removes a Period object to an array as well as it's associated displayed dot through it's index
 * @param {string} l - The index of the Period object
 * 
*/
function removePeriod(l){
    pomodots.removeChild(pomodots.children[l]);
    //Adds shadow to the new first dot if it didn't have one already
    if(pomodots.children.length > 0 && !pomodots.children[0].classList.contains('shadow')){
        pomodots.children[0].classList.add('shadow');
    }
    this_periodlist.splice(l, 1);
}


/** 
 * Starts the beginning of a new cycle.
 * Should be ran everytime the pomodoro mode is changed or when the user wants to restart*
*/
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
        //Javascript doesn't have a way to deep copy without more code I'm too lazy to implement so I guess we have to do this
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

/** 
 * Takes a Period config and replaces it with the wanted Period config in order to load confgi presets
 * @param {string} toReplace - The "periods" property stored in the said config to be altered
 * @param {string} newlsit - the "periods" property stored in the said config to alter toReplace
*/
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


/** 
 * Updates the display of the dots so that it matches the current cycle
 * @param {bool} restart - Will completely reset the display if true. Otherwise it updates properties of the dot to the front-end display.
 * Should be set to true if restarting the cycle itself
*/
function updateDots(restart){
    //Makes sure to cap the amount of dots that can be displayed so that someone doesn't end up lagging the site by showing 10k dots at once
    if(c.max_periods > 30){
        c.max_periods = 30
    }
    if(c.max_periods < 0){
        return;
    }
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
        //This prevents cases where the dots displayed are less than the max_periods when they should always be equal in Overflow mode
        if(c.pomodoro_mode == "overflow"){
            if(max_periods > lengthOfCycle(this_cycle)){
                max_periods = lengthOfCycle(this_cycle)
            }
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
        }
        else if(pomodots.children[0].classList.contains('shadow') && !c.glowFirstElement){
            pomodots.children[0].classList.remove('shadow')
        }
    } catch (error){
        console.error(error)
    }
}   

/** 
 * Updates a property of the dot based on any changes made in it's associated Period object.
 * Mainly used in individual Period configurations where it affects what should be displayed.
 * @param {string} prop - The property that was altered and thus needs to be changed by display
*/
function updateDotsByPeriods(prop){
    this_periodlist.forEach((p) => {
        let ele = document.getElementById(p.dot_id);
        if(prop == "color"){
            p.color = getPeriodByLabel(p.label).color
            ele.style.backgroundColor = p.color
        }
        if(prop == "duration")
            p.duration = getPeriodByLabel(p.label).duration
    })
}

function displayTime(){
    min = Math.floor(time / 60);
    sec = Math.ceil(time % 60);
    if(sec == 60){
        min += 1
        sec = 0 
    }
    disMin.innerHTML = min.toString().padStart(2, '0');
    disSec.innerHTML = sec.toString().padStart(2, '0');
    updateTimeEstimate()
}

/** 
 * Updates the display of the settings aside so that it matches what is in the config
 * @param {string} settings - The element(s) that contain and send input values from the display to here 
*/
function updateDisplayOfSettings(settings){
    if(settings == 'help_text'){
        if(c.hide_help){
            document.getElementById('help_button').innerHTML = "Show Controls"
            document.getElementById('help_text').classList.add('hidden')
        }
        else{
            document.getElementById('help_button').innerHTML = "Hide Controls"
            document.getElementById('help_text').classList.remove('hidden')
        }
        return;
    }
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

/** 
 * Initalizes the settings aside and its display so that it matches what is in the config.
*/
function initalizeSettings(){
    updateDisplayOfSettings(displayed_settings)  
    updateDisplayOfSettings('help_text')
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

/** 
 * Fetches the config of the requested type of Period by it's label.
 * Tbh it should be named 'getPeriodConfigByLabel', but im too lazy for alldat
 * @param value - The label of the requested Period type
*/
function getPeriodByLabel(value){
    for(let i = 0; i < periods.length; i++){
        if(periods[i].label == value){
            return(periods[i])
        }
    }
}

function updateSettings(){
    updateDisplayOfSettings(displayed_settings) 
    if(settings_set_time_dur.value != ""){
        //Change HTML based on settings
    }
}

/** 
 * Updates the Time Estimate display so that it accurately protrays the...time estimate WHAT DO YOU EXPECT???
*/
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
        //Makes sure that the time is displayed in proper HH:MM format
        estHr.innerHTML = ~~((timeest % 86400)/ 3600)
        estMin.innerHTML = ~~((timeest % 3600) / 60)
        //I have no idea why, but you have to stringify and pad the value seperately instead of on the same line where the value is calculated. Otherwise it won't pad the string with a "0" when needed: "ex: "
        estHr.innerHTML = estHr.innerHTML.toString().padStart(2, '0')
        estMin.innerHTML = estMin.innerHTML.toString().padStart(2, '0')
        return;
    }
    else{
        //Makes sure that the time is displayed in proper HH:MM AM/PM format
        estHr.innerHTML = ~~((timeest % 43200) / 3600)
        estMin.innerHTML = ~~((timeest % 3600) / 60)
        //Makes sure that the HH portion stays between 00 and 12
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
        return;
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

/** 
 * Handles setting time by input in input mode
*/
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

/** 
 * Handles when the Period is finished
 * @param {bool} skip - Will instead skip the Period instead. Used for when the user wants to skip the Period before it is done.
*/
function timerDone(skip){
    let tp = this_periodlist[0] //tp -> This Period
    if(c.pomodoro_mode == "timer"){
        time = 0
        loadAudio(c.default_alarm_sound).then(s => {
           s.play()
        })
        clearInterval(thisInterval);
        new Notification(`Your timer is done!`)
        button.innerHTML = "Restart"
        periodtitle.classList.add('hide')
        state = "done"
        displayTime()
        return;
    }
    if(!skip){
        loadAudio(c.default_alarm_sound).then(s => {
            s.play()
        })
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

/** 
 * Appends a dot and handles it based on it's respective Period. Used to update visual display
 * @param {Period} dot - The Period that needs to be appended as a dot
*/
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

/** 
 * Determines whether said index of the cycle is a multi-cycle.
 * A multi-cycle ('3x', '5x', '10x', etc.) is used so that the segment before it is cycle. 
 * For instance: ['sb', 'w', '3x'] would repeat ['sb', 'w'] 3 times.
 * Another instance: ['w', '3x', 'sb', '2x'] would repeat ['w'] 3 times, and then ['sb'] 2 times.
 * @param {string} element - The subset of the cycle
 * @returns {bool} isMulti
*/
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

function showOnlyOneSetting(id){
    document.querySelectorAll('settings_icon_group').forEach(ele => {
        if(ele.id === id){
            if(ele.classList.contains('hide')){
                ele.classList.remove('hide')
            }
        }
        else if(!ele.classList.contains('hide')){
            ele.classList.add('hide')
        }
    })
}

/**
 * Returns the length of the cycle
 * @param {array} cycle
 * @returns length 
 */
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

/**
 * Checks if cycle is valid
 * @param {*} cycle 
 * @returns cycle, and false if not valids
 */
function isCycleFormatted(cycle){
    //Take input and put into array
    let arr = cycle.split(',').map(seg => `${seg.trim()}`);
    //Go through array and detect whether it matches w/ a name or label
    for(let a of arr){
        console.log(a)
        let b = c.periods.find(item => item['label'] === a)
        if(!b){
            b = c.periods.find(item => item['name' === a])
        }
        if(!b){
            if(isMultiCycle(a)){
                continue;
            }
            else{
                return false;
            }
        }
    }
    //Return true if valid
    return arr;
}

/**
 * Appends a whole cycle to this_cycle
 * @param {array} cycle
 */
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

/**
 * Sets periods initially for the timer if needed
 */
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

/**
 * Calculates the difference in milliseconds through intervals and then subtract that from the time.
 * Ensures that the timer doesn't "lag" behind due to setInterval() and setTimeout() inconsistencies
 * @param {*} bef 
 */
function runTimer(bef){
    thisInterval = setInterval(function() {
        if (time <= intervalinms / 1000){
            timerDone(false);
            return;
        }
        let aft = Date.now()
        let change = aft - bef
        time -= change / 1000 //Converts change in ms to s
        bef = aft
        displayTime()
    }, intervalinms)
}

function runStopwatch(bef){
    thisInterval = setInterval(function() {
        let aft = Date.now()
        let change = aft - bef
        time += change / 1000 //Converts change in ms to s
        bef = aft
        displayTime()
    }, intervalinms)
}

//Made this a seperate function so that I don't have to copy and paste code 
/**
 * Checks the current state and then determines what should happen after. Used for the button below the timer
 */
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
            runStopwatch(Date.now());
        }
        else{
            runTimer(Date.now());
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

/**
 * Loads audio and returns a type Audio
 */
async function loadAudio(n){
    //Loads JSON
    var audiojson
    //We have to return the fetch as when we return inside the fetch it returns to the function, not to what called the function.
    return fetch(`../data/defaults/sounds.json`)
    .then(res => res.json()).then(data => {
        audiojson = data;
        //Sorts through JSON to find speicfic audio file via name
        for (const s of audiojson.sounds){
            if(s.target_name == n){
                if(!s.isURL){
                    //Loads the audio file and returns it
                    let i = new Audio(`../assets/audio/${s.audio}`);
                    i.volume = c.sounds.find(j => j.target_name === n).volume; //Looks through array for specific key: value pair
                    return i;
                } 
            }
        }
        throw new Error("File was not found when loading audio with the name " + n)
    }).catch(error => {
        // Handle any errors that occur during the fetch
        console.error(`Error loading audio name ${n}:`, error);
        return;
    });
}
    
//Start of the program
/*So exciting!!
/* */

/**
 * Intializes the JSON config used
 */
function startJSON(){
    //Javascript doesn't have a way to deep copy without more code I'm too lazy to implement so I guess we have to do this
    periods = JSON.parse(JSON.stringify(c.periods))
    this_cycle = JSON.parse(JSON.stringify(c.cycle))
    loadAudio(c.default_button_press_sound).then(s => {
        buttonclickaudio = s
    })
    uploadBackgroundIMG(c.background_image)
    askNotificationPermission()
    pomodots.removeChild(pomodots.children[0]);
    startOfTimer();
    button.dataset.state = 'start';
    console.log(`Loaded in ${this_periodlist.length} periods`)
    setInterval(updateTimeEstimate, 1000)
    //buttonclickaudio.volume = c.sounds.find(i => i.target_name === c.default_button_press_sound)
    initalizeSettings()
}

function verifyGoogleUser(){
    //Fetches route where user logs in
    fetch(`http://localhost:5000/protected`).
    then(res => {
        console.log(res)
    })
}

/**
 * Appends a whole cycle to this_cycle
 * @param {string} configId - Token
 * @param {object?} updates - What JSON needs to be updated
 */
function updateUserConfig(configId, updates){
    //console.log(JSON.stringify(updates))
    //Fetches the database and updates the specficied user's document
    fetch(`http://localhost:3000/user_configs/${configId}`, {
        method: 'PATCH',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Updated User Config')
    })
    .catch(error => {
        console.log('Error updating user config:', error)
    })
}

//Used to fetch data
if(token == 'devmode'){
    fetch(`../data/dev-configs/test-config.json`)
    .then(res => res.json())
    .then(data => {
    c = data;
    startJSON()
}).catch(error => {
    // Handle any errors that occur during the fetch
    console.error('Error fetching or parsing data:', error);
});
} else {
    fetch(`http://localhost:3000/user_configs/${token}`)
    .then(res => res.json())
    .then(data => {
        console.log('Fetched User Configs:', data);
        c = data;
        startJSON()
    }).catch(error =>{
        console.log('Error fetching user configs', error);
        document.getElementById("periodtitle").innerHTML = "Could not load user: Either server is down or not working properly"
    })
}

verifyGoogleUser();


//Handles when the button is pressed
button.addEventListener("click", function(){
        buttonclickaudio.play();
        checkState();
})

//Handles when a key is pressed
document.addEventListener('keydown', (e) => {
    if(!e.repeat &&  e.code === "Space" &&   settings_aside.classList.contains("settings_shown")){
        buttonclickaudio.play() 
        checkState()
    }
    else if(e.code === "ControlLeft")
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
    //Hides user button
    const a = document.getElementById('user_icon_background')
    if(!a.classList.contains('hide')){
        a.classList.add('hide')
    }
    else{
        a.classList.remove('hide')
    }
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

//Handles the top settings part

// Select all elements with the specified class
const topsettings = document.querySelectorAll('.settings_icon_group');
const wholesettingcats = document.querySelectorAll('.whole_settings_cat')

// Add a click event listener to each element
topsettings.forEach(ele => {
    ele.addEventListener('click', () => {
        // Hide all elements in the specific class
        wholesettingcats.forEach(el => {
            if (!el.classList.contains('hide')) el.classList.add('hide');
        });
        // Show the clicked element's respective target
        let t;
        if(ele.id == 's_i_user'){
            t = document.getElementById('user_settings_whole')
        }
        else if(ele.id == 's_i_general'){
            t = document.getElementById('general_settings_whole');
        }
        else if(ele.id == 's_i_timer'){
            t = document.getElementById('time_settings_whole')
        }
        if (t.classList.contains('hide')){ t.classList.remove('hide'); t.classList.add('selected') };
    });
});

//Changing time in clock
clockdisplay.addEventListener("click", function(){
    inSec.value = Math.ceil(time % 60).toString().padStart(2, '0');
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

document.getElementById('help_button').addEventListener("click", function(){
    if(c.hide_help == false){
        c.hide_help = true;
        updateDisplayOfSettings('help_text')
    }
    else if(c.hide_help == true){
        c.hide_help = false;
        updateDisplayOfSettings('help_text')
    }
})

//Enforces a 2-digit limit when changing time in the clock
for(let sel of document.getElementsByClassName("Tin")){
    sel.addEventListener('input', function(){
        //The line below take the whole string, selects every non-number, and replaces it with an empty string. Love you ChatGPT for explaining it :))
        this.value = this.value.replace(/\D/g, '');
        this.value = this.value.slice(0, 2);
})
}

//Settings
displayed_settings.forEach((ele) => {
    ele.addEventListener('change', function(){
        switch(ele.id)
        {
            //General Settings
            case 's_time_est_toggle':
                c.showTimeEstimated = this.checked;
                updateUserConfig(token, {
                    showTimeEstimated: this.checked
                })
                updateTimeEstimate();
                break;
            case 's_time_est_format':
                c.est_time_format = this.value;
                updateUserConfig(token, {
                    est_time_format: this.value
                })
                updateTimeEstimate();
                break;
            case 's_glow_first_toggle':
                c.glowFirstElement = this.checked;
                updateUserConfig(token, {
                    glowFirstElement: this.checked
                })
                updateDots(false)
                break;
            case 's_notif_all':
                c.notificationForAll = this.value
                updateUserConfig(token, {
                    notificationForAll: this.value
                })
                break;
            case 's_strch_bkground':
                c.stretch_background_image = this.value
                updateUserConfig(token, {
                    stretch_background_image: this.value
                })
                stretchBackgroundImage(c.stretch_background_image)
                break;
            case 's_url_bkground_img':
                c.background_image = this.value
                updateUserConfig(token, {
                    background_image: this.value
                })
                uploadBackgroundIMG(c.background_image)   
                break; 
            case 's_max_dots_shown':
                c.max_periods = Number(this.value)
                updateUserConfig(token, {
                    max_periods: Number(this.value)
                })
                updateDots(false)
                break; 
            case 's_timer_mode':
                c.pomodoro_mode = this.value
                updateUserConfig(token, {
                    pomodoro_mode: this.value
                })
                startOfTimer()
                break;
            case 'cycle_presets':
                setCyclePreset(this.value)
                break;
            case 's_alarm_sound':
                c.default_alarm_sound = this.value
                updateUserConfig(token, {
                    default_alarm_sound : this.value
                })
                break;
            case 's_button_sound':
                c.default_button_press_sound = this.value
                loadAudio(this.value).then(s => {
                    buttonclickaudio = s
                })
                updateUserConfig(token, {
                    default_button_press_sound: this.value
                })
                break;
            //Individual Periods 
            case 's_p_dropdown':
                try{
                    document.getElementById("spdot").style.backgroundColor = getPeriodByLabel(this.value).color;
                    tps_selected = getPeriodByLabel(this.value);
                    document.getElementById("s_p_dur").value = tps_selected.duration;
                    document.getElementById("s_p_color").value = tps_selected.color;
                } catch(error){
                    console.log(`${error} => Caused when element ${ele.id} was changed`)
                }
                break;
            case 's_p_dur':
                try{
                    tps_selected = getPeriodByLabel(document.getElementById('s_p_dropdown').value);
                    tps_selected.duration = Number(this.value);
                    updateDotsByPeriods("duration");
                    //Checks if timer hasn't before changing the time
                    settime = Number(this_periodlist[0].duration)
                    if(state == "start"){
                        time = settime
                        displayTime()
                    }
                } catch (error){
                    console.log(error)
                }
                break;
            case 's_p_color':
                try {
                    tps_selected = getPeriodByLabel(document.getElementById('s_p_dropdown').value);
                    tps_selected.color = this.value;
                    document.getElementById("spdot").style.backgroundColor = this.value;
                    updateDotsByPeriods("color");
                } catch (error) {
                    console.log(error)
                }
                break;
            case 's_p_description':
                tps_selected = getPeriodByLabel(document.getElementById('s_p_dropdown').value);
                tps_selected.description = this.value;
            case 's_p_alarm_sound':
                c.default_alarm_sound = this.value
                updateUserConfig(token, {
                    default_alarm_sound: this.value
                })
                break;
            case 's_p_sound':
                loadAudio(this.value).then(s => {
                    console.log(s)
                    buttonclickaudio = s;
                })
                break;
        }
    })
})

//Handles saving buttons when clicked
document.getElementById("save_individual").addEventListener("click", function(){
    //Simply copies and replaces the old period settings with the current one loaded, along other important settings
    //Inefficent but simple. Will update after deployment
    let a = periods
    c.periods = a
    updateUserConfig(token, {
        periods: a 
    })
    let b = isCycleFormatted(document.getElementById("s_cycle_input").value)
    if(b){
        c.cycle = b
        updateUserConfig(token, {
            cycle : b
        })
        startOfTimer()
    }
    else if(!(b == "" || b == null)){
        console.error(`Error while attempting to save settings: cycle ${b} is not valid`)
    }
})