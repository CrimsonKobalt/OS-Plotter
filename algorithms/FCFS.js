const Process = require('../public/javascripts/process');
const loadXML = require('../public/XML_loader');
const compare = require('../public/javascripts/comparatorService');
const grouper = require('../public/javascripts/grouper');
const Averages = require('../public/javascripts/averages');

//main class that gets exported & has all the necessary functionality
module.exports = class FCFS{
    constructor(dataset, listSize){
        this.array = dataset;
        this.arraySize = listSize
        this.averages = new Averages();

        this.runSimulation();
    }

    static create(listSize){
        return new FCFS(loadXML(listSize), listSize);
    }

    runSimulation(){
        findProcessTimes(this.array, this.arraySize, this.averages);
    }

    printAverages(){
        console.log("averages for First-Come First-Serve:");
        console.log("average TAT: " + this.averages.TAT);
        console.log("average nTAT: " + this.averages.nTAT);
        console.log("average waiting time: " + this.averages.waitTime);
    }

    sortOn_Service(){
        this.array.sort(compare);
    }

    createDataset(){
        return grouper(this.array, this.arraySize);
    }

    getArray(){
        return this.array;
    }

    getAverage_TAT(){
        return this.averages.get_TAT();
    }

    getAverage_nTAT(){
        return this.averages.get_nTAT();
    }

    getAverageWait(){
        return this.averages.getWaitTime();
    }
}

//helper method that does the heavy lifting
let findProcessTimes = function(array, arraySize, averages){
    array[0].setWaitTime(0);
    array[0].setStartTime(array[0].getArrivalTime());
    array[0].setExitTime(array[0].getStartTime() + array[0].getServiceTime());
    array[0].update_nTAT();
    //also update averages
    averages.TAT = array[0].get_TAT();
    averages.nTAT = array[0].get_nTAT();
    averages.waitTime = array[0].getWaitTime();

    for(let i = 1; i<arraySize; i++){
        let timePreviousFinish = 
            array[i-1].getArrivalTime() +
            array[i-1].getWaitTime() +
            array[i-1].getServiceTime();
    
        let thisWaitTime = timePreviousFinish - array[i].getArrivalTime();
        if(thisWaitTime < 0) thisWaitTime = 0;

        array[i].setWaitTime(thisWaitTime);
        
        array[i].setStartTime(timePreviousFinish);
        
        array[i].setExitTime(timePreviousFinish + array[i].getServiceTime());

        array[i].update_nTAT();

        averages.TAT += array[i].get_TAT();
        averages.nTAT += array[i].get_nTAT();
        averages.waitTime += array[i].getWaitTime();
    }
    averages.divideAverages(arraySize);
}