const Process = require("../public/javascripts/process");
const loadXML = require("../public/XML_loader");
const compare = require('../public/javascripts/comparatorService');
const grouper = require('../public/javascripts/grouper');
const Averages = require('../public/javascripts/averages');

module.exports = class SRT{
    constructor(dataset, listSize){
        this.array = dataset;
        this.arraySize = listSize;
        this.averages = new Averages();

        this.runSimulation();
    }

    static create(listSize){
        return new SRT(loadXML(listSize), listSize);
    }

    runSimulation(){
        findProcessTimes(this.array, this.arraySize, this.averages);
    }

    printAverages(){
        console.log("averages for Shortest Remaining Time:");
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

/*
    Description of the algorithm:
        1) start the algorithm with 3 pointer variables
                a) nextArriving = 0     #pointing to the first process
                b) firstUnfinished      #pointing to the first process
                c) currentProcess       #pointing nowhere yet;
            and with the currentTime being the arrival-time of the first process.
            and with an array that keeps track of the remaining times of all processes
            next, for every iteration:
        2) find the first point of interest: min(process finishes, next process arrives)
                a) current process finishes? find the next one to execute
                    if the queue is empty, jump to the next arrival & start that one
                b) a new process arrives? check if it replaces the current process
        3) at the end, make sure to fix the averages as well.
                
*/
function findProcessTimes(array, arraySize, averages){
    //create an array that will hold remaining times
    let remainingTime = [];
    for(let i = 0; i<arraySize; i++){
        remainingTime.push(array[i].getServiceTime());
    }
    //pointers
    let nextArriving = 1;
    let firstUnfinished = 0;
    let currentProcess = 0;

    //runTime variable
    let currentTime = array[0].getArrivalTime();

    //initialise the first process
    array[0].setStartTime(array[0].getArrivalTime());

    while(firstUnfinished != arraySize){
        //jump to first point of interest: new arrival or current finish
        let timeToPOI = 0;

        if(nextArriving == arraySize) timeToPOI = remainingTime[currentProcess];
        else{
            timeToPOI = Math.min(remainingTime[currentProcess], array[nextArriving].getArrivalTime() - currentTime);
        }
        /*advance to timeOfPOI
            1) update remainingTime[currentProcess]
            2) check if current process finishes
                if yes finish this process up and find next one
                    see if firstUnfinished has moved!
                    set the end-values! 
                if no  update the remainingTime()-array and load a new process
        */

        currentTime += timeToPOI;
        remainingTime[currentProcess] -= timeToPOI;
        
        //case: process has finished
        if(remainingTime[currentProcess] < 0) console.log("negative remaining time?");
        if(remainingTime[currentProcess] <= 0){

            //process has now finished
            array[currentProcess].setExitTime(currentTime);
            //a process' wait time = (its exit time - its start time) - its service time
            
            array[currentProcess].setWaitTime(array[currentProcess].getExitTime()
                                                 - array[currentProcess].getArrivalTime() 
                                                 - array[currentProcess].getServiceTime());
            //now we can also fix the TAT's
            array[currentProcess].update_nTAT();
            //and contribute to the averages
            averages.TAT += array[currentProcess].get_TAT();
            averages.nTAT += array[currentProcess].get_nTAT();
            averages.waitTime += array[currentProcess].getWaitTime();
            

            //check if firstUnfinished has moved
            //this returns arraySize if we're done
            firstUnfinished = updateFirstUnfinished(array, arraySize, firstUnfinished);
            if(firstUnfinished == arraySize) continue;

            //now find the shortest time remaining process.
            let shortestProcess = 999999999;
            let shortestProcessIndex = firstUnfinished;

            //only update nextArriving here is currentTime == nextArriving-time
            nextArriving = updateArrivalLoper(array, arraySize, nextArriving, currentTime);

            //if no processes are waiting, immediately skip to the arrival of the next process.
            if(firstUnfinished == nextArriving){
                let timedif = array[nextArriving].getArrivalTime() - currentTime;
                currentTime += timedif;
                nextArriving = updateArrivalLoper(array, arraySize, nextArriving, currentTime);
                for(let i = firstUnfinished; i<nextArriving; i++){
                    if(remainingTime[i] < shortestProcess){
                        shortestProcess = remainingTime[i];
                        shortestProcessIndex = i;
                    }
                }
                currentProcess = shortestProcessIndex;
                array[currentProcess].setStartTime(currentTime);
                continue;
            }
            

            for(let i = firstUnfinished; i<nextArriving; i++){
                if(array[i].getExitTime() == 0){
                    if(remainingTime[i] < shortestProcess){
                        shortestProcess = remainingTime[i];
                        shortestProcessIndex = i;
                    }
                }
            }
            //now we have found the next process to load in.
            currentProcess = shortestProcessIndex;
            if(array[currentProcess].getStartTime() == 0) array[currentProcess].setStartTime(currentTime);
            continue;
        }

        //case: process has not finished
        if(remainingTime[currentProcess] > 0){
            //update the remainingTime-array -- this has been done before the case!
            //move to the new time           -- this has been done before the case!
            //move over the nextArriving-pointer -- if all have arrived, this becomes == arraySize
            nextArriving = updateArrivalLoper(array, arraySize, nextArriving, currentTime)
            //update the current-process pointer
            let shortestProcess = 99999999;
            let shortestProcessIndex = firstUnfinished;

            for(let i = firstUnfinished; i<nextArriving; i++){
                if(array[i].getExitTime() == 0){
                    if(remainingTime[i] < shortestProcess){
                        shortestProcess = remainingTime[i];
                        shortestProcessIndex = i;
                    }
                }
            }

            currentProcess = shortestProcessIndex;
            if(array[currentProcess].getStartTime() == 0) array[currentProcess].setStartTime(currentTime);
            continue;
        }
    }
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