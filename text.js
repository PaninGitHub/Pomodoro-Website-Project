/**
 * Yolo
 */
export const trans = {
    static(txt, ele)
    {
        ele.innerHTML = txt;
    },
    typewrite(bef, aft, delay, ele) 
    {
        //Note: MUST have dataset property "inTrans"
        ele.dataset.intrans = "true";
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
        ele.dataset.intrans = "false";
    }
}

