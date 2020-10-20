#!/usr/bin/env node
const {argv} = require('yargs')
const logger = require('../lib/logger')
const ncached = require('../lib/server');
const port = argv.p || 11212

ncached(port, err => {
  if(!err) {
    logger.info('Server started on port ' + port)
  } else {
    logger.error('The server could not start: ' + err)
  }
});