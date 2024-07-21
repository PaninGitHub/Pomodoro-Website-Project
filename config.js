import { Peroid } from "./classes.js";

export const s = 
{
    ////Info
    reg_peroids: ['w', 'sb', 'lb'],
    ////Pomodoro Settings
    //How many pomodoro cycles is wanted
    amtOfPDots: 1,
    //What are the work and breaks cycle
    wb_cycle: ['w', 'w', 'w', 'sb'],
    //Duration of work and break cycles
    wb_dur: {
        'w': 20 * 60,
        'sb': 10 * 60,
        'lb': 5 * 60,
    },
    ////Colors
    dot_w: "#586A6A",
    dot_sb: "#DAD4EF",
    dot_lb: "#DAD4EF",
}