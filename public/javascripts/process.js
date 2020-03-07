module.exports = class Process {
    constructor(pid, arrivalTime, serviceTime){
        this.pid = pid;
        this.arrivalTime = arrivalTime;
        this.serviceTime = serviceTime;
        this.waitTime = 0;
        this.startTime = 0;
        this.exitTime = 0;
        this.TAT = 0;
        this.nTAT = 0;
    }

    setWaitTime(time){
        this.waitTime = time;
    }

    setServiceTime(time){
        this.serviceTime = time;
    }

    update_TAT(){
        this.TAT = this.serviceTime + this.waitTime;
        //servicetime + waittime == exittime - starttime!!
    }

    update_nTAT(){
        this.update_TAT();
        this.nTAT = this.TAT/this.serviceTime;
    }

    setExitTime(time){
        this.exitTime = time;
    }

    setStartTime(time){
        this.startTime = time;
    }

    set_TAT(value){
        this.TAT = value;
    }

    set_nTAT(value){
        this.nTAT = value;
    }

    getWaitTime(){
        return this.waitTime;
    }

    getServiceTime(){
        return this.serviceTime;
    }

    getArrivalTime(){
        return this.arrivalTime;
    }

    getStartTime(){
        return this.startTime;
    }

    get_TAT(){
        return this.TAT;
    }

    get_nTAT(){
        return this.nTAT;
    }

    getExitTime(){
        return this.exitTime;
    }
}