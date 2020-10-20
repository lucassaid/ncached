const {
  checkSize,
  checkExpiration,
  validateCas,
} = require('./validators')

const { 
  handleRetrievalCommand,
  handleStorageCommand,
  handleAppendOrPrepend,
} = require('./handlers')

const retrievalCommandFormat = ['string', 'string']
const storageCommandFormat = ['string', 'string', 'number', 'number', 'number']

/**
 * Protocol objects have the following props:
 * 
 * `format` (array):
 * All the params the command should have.
 * 
 * `handlers` (array):
 * Array with handlers. Every handler is an array too, with this structure:
 * The function to perform, an optional value to return if the function fails,
 * and an optional value to return if the function succeeds.
 * 
 * `needsData` (boolean):
 * Whether this command is supposed to store data or not.
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