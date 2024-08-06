/**
 * Self-adjusting interval to account for drifting
 * Credit to Leon Williams on StackOverflow
 * 
 * @param {function} workFunc  Callback containing the work to be done
 *                             for each interval
 * @param {int}      interval  Interval speed (in milliseconds)
 * @param {function} errorFunc (Optional) Callback to run if the drift
 *                             exceeds interval
 */
function AdjustingInterval(workFunc, interval, errorFunc, starttime) {
    var that = this;
    var timeout;
    this.interval = interval;
    this.bef = starttime

    this.start = function() {
        timeout = setTimeout(step, this.interval);
    }

    this.stop = function() {
        clearTimeout(timeout);
    }

    function step() {

    }
}