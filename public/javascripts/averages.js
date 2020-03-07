//helper class for added clarity
module.exports = class Averages{
    constructor(){
        this.TAT = 0;
        this.nTAT = 0;
        this.waitTime = 0;
    }

    divideAverages(value){
        this.TAT /= value;
        this.nTAT /= value;
        this.waitTime /= value;
    }

    get_TAT(){
        return this.TAT;
    }

    get_nTAT(){
        return this.nTAT;
    }

    getWaitTime(){
        return this.waitTime;
    }
}