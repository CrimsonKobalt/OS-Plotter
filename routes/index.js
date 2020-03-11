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
  res.render('../views/index');
});

router.all('*', function(req, res){
  res.redirect('/');
});

module.exports = router;