const { 
  handleRetrievalCommand,
  handleStorageCommand,
  handleAppendOrPrepend,
} = require('./handlers')

const {
  validateSize,
  validateGetOrGets,
  doesntExists,
  exists,
  validateCas,
} = require('./validators')

const retrievalCommandFormat = ['string', 'string']
const storageCommandFormat = ['string', 'string', 'number', 'number', 'number']

const protocols = {
  get: {
    format: retrievalCommandFormat,
    handler: handleRetrievalCommand,
    validators: [validateGetOrGets],
  },
  gets: {
    format: retrievalCommandFormat,
    handler: handleRetrievalCommand,
    validators: [validateGetOrGets],
  },
  set: {
    format: storageCommandFormat,
    handler: handleStorageCommand,
    validators: [validateSize],
    needsData: true
  },
  add: {
    format: storageCommandFormat,
    handler: handleStorageCommand,
    validators: [validateSize, doesntExists],
    needsData: true,
  },
  replace: { 
    format: storageCommandFormat,
    handler: handleStorageCommand,
    validators: [validateSize, exists],
    needsData: true,
  },
  append: {
    format: storageCommandFormat,
    handler: handleAppendOrPrepend,
    validators: [validateSize, exists],
    needsData: true
  },
  prepend: {
    format: storageCommandFormat,
    handler: handleAppendOrPrepend,
    validators: [validateSize, exists],
    needsData: true
  },
  cas: { 
    format: [ ...storageCommandFormat, 'string'],
    handler: handleStorageCommand,
    validators: [validateSize, validateCas],
    needsData: true,
  }
}

module.exports = protocols