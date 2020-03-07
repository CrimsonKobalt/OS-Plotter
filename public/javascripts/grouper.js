const Process = require('./process');
//this has been thoroughly tested by now & should work for every class & listsize above 100...
//usage of this function should be in every algorithm class.

//we assume that the array has already been sorted. this is done by external means implemented in each class
//as a sortOn_Service()-method. As such this simplifies this funtion quite a bit.
module.exports = function groupByPercentile(array, arraySize){
    let newArray = [];
    const numberOfGroups = 100;
    const numberPerGroup = arraySize/numberOfGroups;
    for(let iteratorIndex = 0; iteratorIndex < numberOfGroups; iteratorIndex++){
        //note: iteratorIndex is by default also the (% service time - 1)!
        //the 1st percentile has pid 
        //the 100th percentile has pid 99
        //to fix this issue, instead make pid = iteratorIndex + 1
        //now 1st percentile has pid 1
        //and 100th percentile has pid 100
        newArray.push(new Process(iteratorIndex + 1, 0, 0));
        for(let i = 0; i < numberPerGroup; i++){
            let index = numberPerGroup*iteratorIndex + i;
            newArray[iteratorIndex].setServiceTime(newArray[iteratorIndex].getServiceTime() + array[index].getServiceTime())
            newArray[iteratorIndex].set_TAT(newArray[iteratorIndex].get_TAT() + array[index].get_TAT());
            newArray[iteratorIndex].set_nTAT(newArray[iteratorIndex].get_nTAT() + array[index].get_nTAT());
            newArray[iteratorIndex].setWaitTime(newArray[iteratorIndex].getWaitTime() + array[index].getWaitTime());
        }
        //make sure to take the average per percentile... everything is still in JIFFY's though!
        newArray[iteratorIndex].setServiceTime(newArray[iteratorIndex].getServiceTime()/numberPerGroup);
        newArray[iteratorIndex].set_TAT(newArray[iteratorIndex].get_TAT()/numberPerGroup);
        newArray[iteratorIndex].set_nTAT(newArray[iteratorIndex].get_nTAT()/numberPerGroup);
        newArray[iteratorIndex].setWaitTime(newArray[iteratorIndex].getWaitTime()/numberPerGroup);
    }
    return newArray;
}