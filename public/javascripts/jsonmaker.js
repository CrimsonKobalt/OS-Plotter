//bedoeling van deze functie is dat men een van de datasets kan isoleren ipv het gehele proces te moeten doorsturen.
//Wens je dit toch te doen is het mogelijk via correcte query-parameters.
//rounds the results to 3 decimal spaces

//Hier gebeurt de conversie van JIFFY's naar seconden! (enkel voor ntat & wait; de default dataset wordt nog in jiffy's gehouden)
const Process = require('./process');

module.exports = function select(dataset, attribute) {
    attribute = attribute.toLowerCase()
    let newArray = [];
    switch(attribute){
        case "ntat":
            for(let i = 0; i<100; i++){
                let value = {
                    percentile: i+1,
                    serviceTime: parseFloat(dataset[i].getServiceTime()/100),
                    value : parseFloat(dataset[i].get_nTAT().toFixed(3))
                }
                newArray.push(value)
            }
            return newArray;
        case "wait":
            for(let i = 0; i<100; i++){
                let value = {
                    percentile: i+1,
                    serviceTime: parseFloat(dataset[i].getServiceTime()/100),
                    value : parseFloat((dataset[i].getWaitTime()/100).toFixed(3))
                }
                newArray.push(value)
            }
            return newArray;
        default:
            return dataset;
    }
}