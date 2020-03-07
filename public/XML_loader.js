const fs = require('fs');
const xml2js = require('xml2js');
const parseString = xml2js.parseString;
const Process = require('./javascripts/process');

const loadXML = function(listnumber){
    const resourceString = "/resources/processen"+listnumber+".xml";
    let xml = fs.readFileSync(__dirname + resourceString, "utf-8");
    let array = [];

    parseString(xml, function(err, result) {
        let processlist = result.processlist.process;
        let i;
        for(i=0; i<listnumber;i++){
            let process = processlist[i];
            array.push(new Process(parseInt(process.pid[0]), 
                parseInt(process.arrivaltime[0]), 
                parseInt(process.servicetime[0])));
        }
    });
    return array;
};

module.exports = loadXML;