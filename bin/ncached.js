#!/usr/bin/env node
const {argv} = require('yargs')

const port = argv.p || 11212

const ncached = require('../lib/server.js');
ncached(port, err => {
  if(!err) {
    console.log('Server started on port ' + port)
  } else {
    console.log('The server could not start: ', err)
  }
});