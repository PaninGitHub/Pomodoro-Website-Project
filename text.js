/**
 * Requirements:
 * Each transition much handle the intrans dataset property.
    * -none -> no transition active
    * -forward -> normal transition (i.e. button transitioning from "Pause" to "Stop" when Ctrl is pressed)
    * -inverse -> inverse transtiion (i.e. button transitioning from "Stop" to "Pause" when Ctrl is released)
 */

export const trans = {
    static(txt, ele)
    {
        ele.innerHTML = txt;
    },
    typewrite(bef, aft, delay, ele) 
    {
        // First loop: counts down from the length of `bef` to 0
        for (let i = bef.length - 1; i > 0; i--) {
            setTimeout(() => {
                ele.innerHTML = bef.substring(0 , i)
            }, delay * 1000 * (bef.length - i));
        }
        // Second loop: appends characters from `aft` to `bef` one by one
        for (let i = 1; i <= aft.length; i++) {
            setTimeout(() => {
                ele.innerHTML = aft.substring(0, i)
            }, delay * 1000 * (bef.length + i)); 
        }
        //ele.dataset.intrans = 'none'
        setTimeout(() => {
            ele.dataset.intrans = 'none'
        }, delay * 1000 * (bef.length * 2.2))
    }
}

