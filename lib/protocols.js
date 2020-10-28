const {
  validateExists,
  validateDoesNotExists,
  validateCas,
} = require('./validators')

const { 
  handleRetrievalCommand,
  handleStorageCommand,
  handleAppendOrPrepend,
} = require('./handlers')

const {
  retrievalCommandFormat,
  storageCommandFormat,
  NOT_FOUND,
  END,
  NOT_STORED,
  EXISTS,
} = require('./constants')

/**
 * Protocol objects have the following props:
 * 
 * `format` (array):
 * All the params the command should have.
 * 
 * `validators` (array):
 * Array with validators. Each validator is an array too, with this structure:
 * The function to perform, and a value to return if the function fails,
 * 
 * `handler` (function):
 * A function to execute after validators. It will likely store or
 * retrieve data from the hashmap.
 */

const protocols = {
  get: {
    format: retrievalCommandFormat,
    validators: [[validateExists, END]],
    handler: handleRetrievalCommand
  },
  gets: {
    format: retrievalCommandFormat,
    validators: [[validateExists, END]],
    handler: handleRetrievalCommand
  },
  set: {
    format: storageCommandFormat,
    validators: [],
    handler: handleStorageCommand,
    validateData: true
  },
  add: {
    format: storageCommandFormat,
    validators: [[validateDoesNotExists, NOT_STORED]],
    handler: handleStorageCommand,
    validateData: true
  },
  replace: {
    format: storageCommandFormat,
    validators: [[validateExists, NOT_STORED]],
    handler: handleStorageCommand,
    validateData: true
  },
  append: {
    format: storageCommandFormat,
    validators: [[validateExists, NOT_STORED]],
    handler: handleAppendOrPrepend,
    validateData: true
  },
  prepend: {
    format: storageCommandFormat,
    validators: [[validateExists, NOT_STORED]],
    handler: handleAppendOrPrepend,
    validateData: true
  },
  cas: {
    format: [ ...storageCommandFormat, 'string'],
    validators: [
      [validateExists, NOT_FOUND],
      [validateCas, EXISTS]
    ],
    handler: handleStorageCommand,
    validateData: true
  }
}

module.exports = protocols