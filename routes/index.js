const express = require('express');
const router = express.Router();
const loadXML = require("../public/XML_loader");
const FCFS = require('../algorithms/FCFS');
const SJF = require('../algorithms/SJF');
const SRT = require('../algorithms/SRT');
const RR = require('../algorithms/RR');
const HRRN = require('../algorithms/HRRN');
const MLFB = require('../algorithms/MLFB');

router.get('/scheduling', function(req, res, next) {
  res.render('../views/behaviour')
});

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.query.dataset){
    let xmlSize = req.query.dataset;

    //    FCFS test block  -- working
    //let FCFSinstance = FCFS.create(xmlSize);
    //FCFSinstance.printAverages();
    //FCFSinstance.sortOn_Service();
    //let testarray = FCFSinstance.createDataset();
    //console.log(testarray);

    //    SJF test block  --  working
    
    //    SRT test block  --  working

    //    RR test block -- working

    //    HRRN test block -- working

    //    MLFB test block -- under construction
    let MLFBinstance = MLFB.create(xmlSize, "linear");
    MLFBinstance.printAverages();

    res.render('../views/index', { dataset: xmlSize });
  } else {
  res.render('../views/index');
  }
});

module.exports = router;