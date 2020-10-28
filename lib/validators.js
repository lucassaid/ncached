const map = require('./hashmap')
const logger = require('./logger')

/**
 * returns true if the key exists and is not expired
 */
function validateExists(command, record) {
  logger.debug('validateExists', command)

  if(!record) return false
  
  // Key exists but it might be expired
  const expired = Date.now() > record.expiration
  if(expired) {
    const key = command[1]
    map.delete(key) // flush expired key
  }
  return !expired
}

/**
 * Returns true if the key doesn't exists
 */
function validateDoesNotExists(command, record) {
  return !validateExists(command, record)
}

/**
 * Returns true if the token corresponds to the key.
 */ 
function validateCas(command, record) {
  logger.debug('validateCas', {command})
  const token = command[5]
  return token == record.cas_token
}

/** 
 * Returns true if this command has all the required params
 */
function validateCommandLength(command, format) {
  logger.debug('validateCommandLength', {command, format})
  return command.length == format.length
}

/**
 * Checks the type of every parameter (only `number` available so far)
 */ 
function validateFormat(command, format) {
  logger.debug('validateFormat', {command, format})
  for(let i = 1; i < format.length; i++) {
    const expectedType = format[i]
    const invalid = expectedType == 'number' && isNaN(command[i])
    if(invalid) return false
  }
  return true
}

module.exports = {
  validateExists,
  validateDoesNotExists,
  validateCommandLength,
  validateFormat,
  validateCas,
}