
time = 60
interval = 200

function runTimer(bef){
    thisInterval = setInterval(function() {
        if (time <= 0.2){
            console.log("Timer is done, " + (Date.now - beg))
            return;
        }
        aft = Date.now()
        change = aft - bef
        time -= change / 1000
        bef = aft
    }, interval)
}

