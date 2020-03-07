const Process = require("../public/javascripts/process");
const loadXML = require("../public/XML_loader");
const compare = require('../public/javascripts/comparatorService');
const grouper = require('../public/javascripts/grouper');
const Averages = require('../public/javascripts/averages');

module.exports = class SJF{
    constructor(dataset, listSize){
        this.array = dataset;
        this.arraySize = listSize;
        this.averages = new Averages();

        this.runSimulation();
    }

    static create(listSize){
        return new SJF(loadXML(listSize), listSize);
    }

    runSimulation(){
        findProcessTimes(this.array, this.arraySize, this.averages);
    }

    printAverages(){
        console.log("averages for Shortest Job First:");
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

function findProcessTimes(array, arraySize, averages){
    //points to the first unfinished process
    let firstUnfinished = 0;
    //points to the next element to check for arrival in the queue
    let nextArriving = 0;

    //current time variable
    //start the algorithm at arrival time of the first element
    let currentTime = array[0].getArrivalTime()

    /*
        algorithm description:
        1)  enter the algorithm with both the nextArriving- and firstUnfinished-pointer at 0
        2)  move the nextArrival-pointer over to the first element that has not yet arrived (if it is not yet == arraySize)
        3)  move firstUnfinished pointer if necessary. if this == arraySize: done;
                then, if this == nextArrival, move to nextArrival time;
        4)  search for the position of the process with the shortest service time
    */

    //array gets to here: checked!
    //1)
    while(firstUnfinished != arraySize){
        //2)
        if(nextArriving != arraySize) nextArriving = updateArrivalLoper(array, arraySize, nextArriving, currentTime);

        //3)
        firstUnfinished = updateFirstUnfinished(array, arraySize, firstUnfinished);

        //check if we are done
        if(firstUnfinished == arraySize) continue;

        //check if the current queue is empty. if it is, jump to the arrival time of the next process & restart the loop
        if(firstUnfinished == nextArriving) {
            currentTime = array[nextArriving].getArrivalTime();
            continue;
        }

        //from here on out, we know the queue is not empty.

        //4) search the shortest unfinished process' index in [firstunfinished, nextArriving[
        let shortestTime = 99999999;
        let shortestTimeIndex = 0;
        for(let i = firstUnfinished; i<nextArriving; i++){
            if(array[i].getExitTime() == 0){
                if(array[i].getServiceTime() < shortestTime){
                    shortestTime = array[i].getServiceTime();
                    shortestTimeIndex = i;
                }
            }
        }
            
        let i = shortestTimeIndex;

        array[i].setStartTime(currentTime);
        array[i].setWaitTime(currentTime - array[i].getArrivalTime());
        array[i].update_nTAT();

        currentTime += array[i].getServiceTime();

        array[i].setExitTime(currentTime);

        //update the average values
        averages.TAT += array[i].get_TAT();
        averages.nTAT += array[i].get_nTAT();
        averages.waitTime += array[i].getWaitTime();
    }

    //make sure to average out the values
    averages.divideAverages(arraySize);
}

function updateFirstUnfinished(array, arraySize, loper){
    //returns the position of the first unfinished process
    //returns loper == arraySize if all processes have finished.
    if(loper >= arraySize) return arraySize;
    while(array[loper].getExitTime() != 0){
        loper++;
        if(loper == arraySize) return arraySize;
    }
    return loper;
}

//updates position of arrivalLoper to the nextArrival
function updateArrivalLoper(array, arraySize, loper, currentTime){
    if(loper >= arraySize) return arraySize;
    while(array[loper].getArrivalTime() <= currentTime){
        loper++;
        if(loper == arraySize) return arraySize;
    }
    return loper;
}