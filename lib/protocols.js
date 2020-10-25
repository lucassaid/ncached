const {
  validateData,
  validateExpiration,
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
 */
const protocols = {
  get: {
    format: retrievalCommandFormat,
    handlers: [
      [validateExpiration, 'END'],
      [handleRetrievalCommand]
    ],
  },
  gets: {
    format: retrievalCommandFormat,
    handlers: [
      [validateExpiration, 'END'],
      [handleRetrievalCommand]
    ],
  },
  set: {
    format: storageCommandFormat,
    handlers: [[validateData],[handleStorageCommand]],
  },
  add: {
    format: storageCommandFormat,
    handlers: [
      [validateData],
      [validateExpiration, 'OK', 'NOT_STORED'],
      [handleStorageCommand]
    ]
  },
  replace: {
    format: storageCommandFormat,
    handlers: [
      [validateData],
      [validateExpiration],
      [handleStorageCommand]
    ],
  },
  append: {
    format: storageCommandFormat,
    handlers: [
      [validateData],
      [validateExpiration],
      [handleAppendOrPrepend]
    ]
  },
  prepend: {
    format: storageCommandFormat,
    handlers: [
      [validateData],
      [validateExpiration],
      [handleAppendOrPrepend]
    ]
  },
  cas: {
    format: [ ...storageCommandFormat, 'string'],
    handlers: [
      [validateData],
      [validateExpiration, 'NOT_FOUND'],
      [validateCas],
      [handleStorageCommand]
    ]
  }
}

module.exports = protocols