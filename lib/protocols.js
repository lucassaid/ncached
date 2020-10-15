const { 
  handleRetrievalCommand,
  handleStorageCommand,
  handleAppendOrPrepend,
} = require('./handlers')
const {
  validateGetOrGets,
  validateAdd,
  validateReplace,
  validateAppendOrPrepend,
  validateCas,
} = require('./validators')

const protocols = {
  get: {
    handler: handleRetrievalCommand,
    validator: validateGetOrGets,
  },
  gets: {
    handler: handleRetrievalCommand,
    validator: validateGetOrGets,
  },
  set: {
    handler: handleStorageCommand,
    needsData: true
  },
  add: {
    handler: handleStorageCommand,
    validator: validateAdd,
    needsData: true,
  },
  replace: { 
    handler: handleStorageCommand,
    validator:  validateReplace,
    needsData: true,
  },
  append: {
    handler: handleAppendOrPrepend,
    validator: validateAppendOrPrepend,
    needsData: true
  },
  prepend: {
    handler: handleAppendOrPrepend,
    validator: validateAppendOrPrepend,
    needsData: true
  },
  cas: { 
    handler: handleStorageCommand,
    validator: validateCas,
    needsData: true,
  }
}

module.exports = protocols