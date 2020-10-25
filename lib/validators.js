const map = require('./hashmap')
const logger = require('./logger')

/**
 * Checks if command exists and the format is correct.
 * On success, returns the protocol inside an object.
 */
function validateCommand(command, protocols) {
  logger.debug('validateCommand', command)

  const commandName = command[0]
  if(commandName == 'quit') return commandName

  // Check if command exists
  const protocol = protocols[commandName]
  if(!protocol) return 'ERROR' 

  // Check if format is correct
  const formatValidation = validateFormat(command, protocol.format)
  if(formatValidation != 'OK') return formatValidation

  return { protocol }
}

/**
 * Checks if data size is equal to the expected size. Returns an object
 * to use later if there is no data, or if the size is less than expected.
 */
function validateData({command, data}) {
  logger.debug('validateData', {command, data})
  if(!data) return { command }
  const expectedSize = Number(command[4])
  const size = Buffer.byteLength(data, 'utf8')
  if(size == expectedSize) return 'OK'
  if(size > expectedSize) return 'CLIENT_ERROR bad data chunk'
  return { command, data: data + '\r\n' }
}

/**
 * Checks if the key exists and is not expired
 */
function validateExpiration({command}, responseOnFail, responseOnPass) {
  logger.debug('validateExpiration', command)
  const key = command[1]
  const record = map.get(key)
  if(!record) return responseOnFail || 'NOT_STORED'
  if(Date.now() > record.expiration) {
    map.delete(key) // flush expired key
    return responseOnFail || 'NOT_STORED'
  }
  return responseOnPass || { record }
}

/**
 * Checks if the token corresponds to the key.
 */ 
function validateCas({command, record}) {
  logger.debug('validateCas', {command, record})
  const token = command[5]
  return token == record.cas_token ? 'OK' : 'EXISTS'
}

/**
 * Validates every param in a given command.
 */ 
function validateFormat(command, format) {
  logger.debug('validateFormat', {command, format})

  // Check if this command has all the required params
  if(command.length < format.length) return 'ERROR'

  // Check the type of every parameter (only `number` available so far)
  let invalid = false
  for(let i = 1; i < format.length; i++) {
    const expectedType = format[i]
    invalid = expectedType == 'number' && isNaN(command[i])
  }
  return invalid ? 'CLIENT_ERROR bad command line format' : 'OK'
}

module.exports = {
  validateCommand,
  validateData,
  validateExpiration,
  validateCas,
  validateFormat
}