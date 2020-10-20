const { 
  handleRetrievalCommand,
  handleStorageCommand,
  handleAppendOrPrepend,
} = require('./handlers')

const {
  checkSize,
  checkExpiration,
  validateCas,
} = require('./validators')

const retrievalCommandFormat = ['string', 'string']
const storageCommandFormat = ['string', 'string', 'number', 'number', 'number']

/**
 * Every protocol object can have the following props:
 * 
 * "format" (array):
 * All the params the command should have
 * 
 * "handlers" (array):
 * Array with handlers. Every handler is an array too, with this structure:
 * The function to perform, a value to return if the function fails (optional),
 * and a value to return if the function succeeds (optional)
 * 
 * "needsData" (boolean):
 * Whether to wait for lines with data after the command or not.
 */

const protocols = {
  get: {
    format: retrievalCommandFormat,
    handlers: [
      [checkExpiration, 'END'],
      [handleRetrievalCommand]
    ],
  },
  gets: {
    format: retrievalCommandFormat,
    handlers: [
      [checkExpiration, 'END'],
      [handleRetrievalCommand]
    ],
  },
  set: {
    format: storageCommandFormat,
    handlers: [[checkSize], [handleStorageCommand]],
    needsData: true
  },
  add: {
    format: storageCommandFormat,
    handlers: [
      [checkSize],
      [checkExpiration, 'OK', 'NOT_STORED'],
      [handleStorageCommand]
    ],
    needsData: true,
  },
  replace: {
    format: storageCommandFormat,
    handlers: [
      [checkSize],
      [checkExpiration],
      [handleStorageCommand]
    ],
    needsData: true,
  },
  append: {
    format: storageCommandFormat,
    handlers: [
      [checkSize],
      [checkExpiration],
      [handleAppendOrPrepend]
    ],
    needsData: true
  },
  prepend: {
    format: storageCommandFormat,
    handlers: [
      [checkSize],
      [checkExpiration],
      [handleAppendOrPrepend]
    ],
    needsData: true
  },
  cas: {
    format: [ ...storageCommandFormat, 'string'],
    handlers: [
      [checkSize],
      [checkExpiration, 'NOT_FOUND'],
      [validateCas],
      [handleStorageCommand]
    ],
    needsData: true,
  }
}

module.exports = protocols