const ProcessClass = require("../public/javascripts/process");
const loadXML = require("../public/XML_loader");
const compare = require('../public/javascripts/comparatorService');
const grouper = require('../public/javascripts/grouper');
const Averages = require('../public/javascripts/averages');

module.exports = class RR{
    constructor(dataset, listSize, q){
        this.array = dataset;
        this.arraySize = listSize;
        this.slicelength = q;
        this.averages = new Averages();

        this.runSimulation();
    }

    static create(listSize, q){
        if(q == null) q = 2;
        if(q == undefined) q = 2;
        return new RR(loadXML(listSize), listSize, q);
    }

    runSimulation(){
        findProcessTimes(this.array, this.arraySize, this.averages, this.slicelength);
    }

    printAverages(){
        console.log("averages for Round Robin with slicelength = "+this.slicelength+" JIFFY's:");
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
}

function findProcessTimes(array, arraySize, averages, slicelength){
    //create an array that will hold the remaining process-times for each process
    //initialise it with values == service time
    let remainingTime = [];
    for(let i = 0; i<arraySize; i++){
        remainingTime.push(array[i].getServiceTime());
    }
    //array that will hold the index for each process that is trying to get a slice
    let queue = [];

    //pointer to active process: assume process with index 0 is loaded in.
    let currentProcess = 0;
    queue.push(0);
    //pointer to the next arriving process. initialise at 1
    let nextArriving = 1;

    //time starts when the first process arrives
    let currentTime = array[0].getArrivalTime();

    //as such, we need to load in the first process
    array[0].setStartTime(currentTime);

    //control variable -- set to false when we are done looping.
    let algorithmRunning = true;

    while(algorithmRunning){
        //jump to first POI -- either process finishes OR slice expires
        let timeToPoi = 0;
        if(currentProcess != null) timeToPoi = Math.min(slicelength, remainingTime[currentProcess]);
        //currentProcess only becomes null when currentProcess finishes & empty queue, while still having remaining times
        else {
            currentTime = array[nextArriving].getArrivalTime();
            //no need to check if nextArriving < arraySize, we will never be in this situation: see further on
            currentProcess = nextArriving;
            nextArriving++;
            array[currentProcess].setStartTime(currentTime);
            continue;
        }

        //jump to that time
        currentTime += timeToPoi;
        remainingTime[currentProcess] -= timeToPoi;

        //now that we are in the new time, check for arrivals & push their index to the queue
        if(nextArriving < arraySize){
            let nextArrivingBefore = nextArriving;
            nextArriving = updateArrivalLoper(array, arraySize, nextArriving, currentTime);
            for(let i = nextArrivingBefore; i<nextArriving; i++){
                queue.push(i);
            }
        }


        if(remainingTime[currentProcess] < 0) console.log("error with slice assignment.");
        if(remainingTime[currentProcess] == 0){
            //if we get here, it means that a process finished before being interrupted
            //TODO:
            //  set exit variables
            //  load in next queue'd process
            //      remove its index from the queue and set currentProcess equal to that value
            //      take into account empty queue   (jump to a new time, set currentProcess to null, continue)
            //      take into account empty queue & nextArriving == arraySize (== we are done: algorithmRunning = false; continue;)
            //  restart the while-loop.

            //set exit variables
            array[currentProcess].setExitTime(currentTime);
            array[currentProcess].setWaitTime(array[currentProcess].getExitTime() - array[currentProcess].getArrivalTime() - array[currentProcess].getServiceTime());
            array[currentProcess].update_nTAT();

            averages.TAT += array[currentProcess].get_TAT();
            averages.nTAT += array[currentProcess].get_nTAT();
            averages.waitTime += array[currentProcess].getWaitTime();

            //fetch next process in the queue if there is one, if not return null to currentprocess & continue
            //if both queue.isEmpty & nextArriving == arraySize, set algorithmRunning to false & continue: we are done
            if(queue.length == 0){
                if(nextArriving >= arraySize){
                    algorithmRunning = false;
                    continue;
                } else {
                    currentProcess = null;
                    continue;
                }
            } else {
                currentProcess = queue.shift();
                if(array[currentProcess].getStartTime() == 0) array[currentProcess].setStartTime(currentTime);
            }
            continue;
        }
        if(remainingTime[currentProcess] > 0){
            //getting here means that process gets interrupted & should be placed back in the queue.
            //then fetch the next process: queue can never be empty: there is always the interrupted process!
            queue.push(currentProcess);
            currentProcess = queue.shift();

            if(array[currentProcess].getStartTime() == 0) array[currentProcess].setStartTime(currentTime);
        }
    }
    averages.divideAverages(arraySize);
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