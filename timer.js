//Sets constants for calling elements in the HTML
const min = document.getElementById("min")
const sec = document.getElementById("sec")

//Sets variables
var timer
var time = 60

//Reduce time by 1 and updates page
function incrementTime() {
time -= 1
}

//Event Listener
