const ProcessClass = require("../public/javascripts/process");
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
}


/*
    algorithm description

    to speed up the process, keep track of 2 pointers:
    currentProcess
    nextArriving

    create an array 'queue' that holds the indices of all unfinished processes
*/

function findProcessTimes(array, arraySize, averages){
    //process helper variables
    let currentProcess = 0;
    let nextArriving = 1;

    //queue
    let queue = [];

    //currenttime in algorithm; start at first arrival
    let currentTime = array[0].getArrivalTime();

    //initialise first process
    array[0].setStartTime(currentTime);

    //control variable
    let algorithmRunning = true;

    while(algorithmRunning){
        let timeToPOI = array[currentProcess].getServiceTime();

        currentTime += timeToPOI;
        
        //update the queue: add all processes that arrived
        while(nextArriving < arraySize && array[nextArriving].getArrivalTime() <= currentTime){
            queue.push(nextArriving);
            nextArriving++;
        }

        //we know current process is done;
        array[currentProcess].setExitTime(currentTime);
        array[currentProcess].setWaitTime(currentTime - array[currentProcess].getArrivalTime() - array[currentProcess].getServiceTime());

        array[currentProcess].update_nTAT();

        averages.TAT += array[currentProcess].get_TAT();
        averages.nTAT += array[currentProcess].get_nTAT();
        averages.waitTime += array[currentProcess].getWaitTime();

        //2 cases now: queue is empty & queue is not empty
        if(queue.length == 0){
            if(nextArriving == arraySize){
                //algorithm is done
                algorithmRunning = false;
                continue;
            } else {
                //jump to next time interval
                currentTime = array[nextArriving].getArrivalTime();
                currentProcess = nextArriving;
                nextArriving++;
                array[currentProcess].setStartTime(currentTime);
                continue;
            }
        }
        if(queue.length != 0){
            //calculate nTAT for each process in the queue,
            //select the one with the lower
            let highest = 0;
            let highestIndex = 0;
            for(let i = 0; i<queue.length; i++){
                array[queue[i]].setWaitTime(currentTime - array[queue[i]].getArrivalTime());
                array[queue[i]].update_nTAT();
                if (array[queue[i]].get_nTAT() > highest){
                    highest = array[queue[i]].get_nTAT();
                    highestIndex = i;
                }
            }
            currentProcess = queue.splice(highestIndex, 1)[0];
            array[currentProcess].setStartTime(currentTime);
            continue;
        }
    }
    averages.divideAverages(arraySize);
}
