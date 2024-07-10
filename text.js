/**
 * 
 */
const trans = {
    static(txt)
    {
        button.innerHTML = txt;
    },
    typewrite(bef, aft, delay) {
        // First loop: counts down from the length of `bef` to 0
        for (let i = bef.length - 1; i > -1; i--) {
            setTimeout(() => {
                button.innerHTML = bef.length(0 , i)
            }, delay * 1000);
        }
        // Second loop: appends characters from `aft` to `bef` one by one
        for (let i = 0; i <= aft.length; i++) {
            setTimeout(() => {
                button.innerHTML = bef.length(0, i)
            }, delay * 1000); 
        }
    }
}

