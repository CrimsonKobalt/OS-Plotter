const ProcessClass = require("../public/javascripts/process");
const loadXML = require("../public/XML_loader");
const compare = require('../public/javascripts/comparatorService');
const grouper = require('../public/javascripts/grouper');
const Averages = require('../public/javascripts/averages');

module.exports = class MLFB{
    constructor(dataset, listSize, type){
        this.array = dataset;
        this.arraySize = listSize;
        this.type = type;
        this.averages = new Averages();

        this.runSimulation();
    }

    static create(listSize, type){
        if(type == null) type = "linear";
        if(type == undefined) type = "linear";
        if(type != "linear") type = "exponential";
        return new MLFB(loadXML(listSize), listSize, type);
    }

    runSimulation(){
        findProcessTimes(this.array, this.arraySize, this.averages, this.type);
    }

    printAverages(){
        console.log("averages for MLFB with "+this.type+" distribution:");
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

function findProcessTimes(array, arraySize, averages, type){
    //help variables
    let currentProcess = 0;
    let nextArriving = 1;

    //array that holds remaining time for each process
    let remainingTime = [];

    //array that holds which queue a process belongs to (0-4), initialise at 0: you start out in the highest priority queue
    let whichQueue = []

    for(let i = 0; i<arraySize; i++){
        whichQueue.push(0);
        remainingTime.push(array[i].serviceTime);
    }

    //array that holds the timeslice each queue represents
    let queueValues = [];

    if(type == "linear"){
        //q = 5i+1
        queueValues = [10, 20, 30, 40, 50];
    } else {
        //q = 2^(i)
        queueValues = [10, 10, 10, 10, 10];
    }

    //the queue itself
    let queue = [];

    //initialisation: load in the first algorithm
    let currentTime = array[currentProcess].getArrivalTime();
    array[currentProcess].setStartTime(currentTime);

    //control variable
    let algorithmRunning = true;

    while(algorithmRunning){
        //step 1: determine the next time of interest
        //  either a process finishes or times out
        
        let timeToPOI = Math.min(queueValues[whichQueue[currentProcess]], remainingTime[currentProcess]);

        //advance to the next timeframe

        currentTime += timeToPOI;
        remainingTime[currentProcess] -= timeToPOI;

        //now that we are in the new time, check for arrivals & push their index to the queue
        if(nextArriving < arraySize){
            let nextArrivingBefore = nextArriving;
            nextArriving = updateArrivalLoper(array, arraySize, nextArriving, currentTime);
            for(let i = nextArrivingBefore; i<nextArriving; i++){
                queue.push(i);
            }
        }

        //now there are 2 legal options: either process is finished, or it timed out
        //  1) the process finished.
        if(remainingTime[currentProcess] < 0){
            console.log("illegal state!");
            break;
        }
        if(remainingTime[currentProcess] == 0){
            //first set exit variables for current process,
            //  then load in the next process
            //  then continue;

            array[currentProcess].exitTime = currentTime;
            array[currentProcess].waitTime = currentTime - array[currentProcess].arrivalTime - array[currentProcess].serviceTime;
            array[currentProcess].update_nTAT();

            averages.TAT += array[currentProcess].get_TAT();
            averages.nTAT += array[currentProcess].get_nTAT();
            averages.waitTime += array[currentProcess].getWaitTime();

            //now load in the next process
                //2 cases: queue is empty or isn't empty
            if(queue.length == 0){
                //jump to next arrival time & load in the next process
                if(nextArriving >= arraySize){
                    //this is the final state: algorithm == done
                    algorithmRunning = false;
                    continue;
                } else {
                    currentTime = array[nextArriving].arrivalTime;
                    array[nextArriving].startTime = currentTime;
                    currentProcess = nextArriving;
                    nextArriving++;
                    continue;
                }
            } else {
                //find the process with highest prio (ie: lowest whichQueue[queue[i]] and load that one in)
                let queuenumber = 5;
                let index = 0;
                for(let i = 0; i<queue.length;i++){
                    if(whichQueue[queue[i]] < queuenumber){
                        queuenumber = whichQueue[queue[i]];
                        index = i;
                    } 
                }
                currentProcess = queue.splice(index, 1)[0];
                if(array[currentProcess].startTime == 0){  
                    array[currentProcess].startTime = currentTime;
                }
                continue;
            }
        }
        //also possible that the current Process does not finish!
        //then put it in the queue where it belongs & load in the next one from the queue
        if(remainingTime[currentProcess] > 0){
            //find which queue the new process goes to
            let queuenr = whichQueue[currentProcess];

            //if this is ==4, set it to three so the process will end back in queue with index 4
            if(queuenr >= 4) queuenr = 3;

            //put it back in the correct queue
            queue.push(currentProcess);
            whichQueue[currentProcess] = queuenr + 1;

            //now we find the next process: here the queue can never be empty!
            let queuenumber = 5;
            let index = 0;
            for(let i = 0; i<queue.length;i++){
                if(whichQueue[queue[i]] < queuenumber){
                    queuenumber = whichQueue[queue[i]];
                    index = i;
                } 
            }
            currentProcess = queue.splice(index, 1)[0];
            if(array[currentProcess].startTime == 0){
                array[currentProcess].startTime = currentTime;
            }
            continue;
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