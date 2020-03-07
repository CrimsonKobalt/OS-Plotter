const express = require('express');
const router = express.Router();
const select = require('../public/javascripts/jsonmaker');
const FCFS = require('../algorithms/FCFS');
const SJF = require('../algorithms/SJF');
const SRT = require('../algorithms/SRT');
const RR = require('../algorithms/RR');
const HRRN = require('../algorithms/HRRN');
const MLFB = require('../algorithms/MLFB');


router.get('/jsontest', function(req, res, next) {
    var myObj = {
        author: [{
            firstname: 'Christophe',
            lastname: 'De Backer'
        }],
        text: "thanks for testing out this API service. Everything seems to be working fine.",
        readme: "this page was developed for a KU Leuven lab project."
    };
    res.json(myObj);
});

router.get('/FCFS', function(req, res, next) {
    const xmlSize = req.query.dataset;
    const graph = req.query.graph;
    let FCFSinstance = FCFS.create(xmlSize);
    FCFSinstance.sortOn_Service();
    let sorted = FCFSinstance.createDataset();
    let result = select(sorted, graph)
    res.send(result);
})

router.get('/SJF', function(req, res, next) {
    const xmlSize = req.query.dataset;
    const graph = req.query.graph;
    let SJFinstance = SJF.create(xmlSize);
    SJFinstance.sortOn_Service();
    let sorted = SJFinstance.createDataset();
    let result = select(sorted, graph);
    res.json(result);
})

router.get('/SRT', function(req, res, next) {
    const xmlSize = req.query.dataset;
    const graph = req.query.graph;
    let SRTinstance = SRT.create(xmlSize);
    SRTinstance.sortOn_Service();
    let sorted = SRTinstance.createDataset();
    let result = select(sorted, graph);
    res.json(result);
})

router.get('/RR', function(req, res, next) {
    const xmlSize = req.query.dataset;
    const graph = req.query.graph;
    const slice = req.query.slice;
    let RRinstance = RR.create(xmlSize, slice);
    RRinstance.sortOn_Service();
    let sorted = RRinstance.createDataset();
    let result = select(sorted, graph);
    res.json(result);
})

router.get('/HRRN', function(req, res, next) {
    const xmlSize = req.query.dataset;
    const graph = req.query.graph;
    let HRRNinstance = HRRN.create(xmlSize);
    HRRNinstance.sortOn_Service();
    let sorted = HRRNinstance.createDataset();
    let result = select(sorted, graph);
    res.json(result);
})

router.get('/MLFB', function(req, res, next) {
    const xmlSize = req.query.dataset;
    const graph = req.query.graph;
    const type = req.query.type;
    let MLFBinstance = MLFB.create(xmlSize, type);
    MLFBinstance.sortOn_Service();
    let sorted = MLFBinstance.createDataset();
    let result = select(sorted, graph);
    res.json(result);
})

module.exports = router;