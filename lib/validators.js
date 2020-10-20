const map = require('./hashmap')
const logger = require('./logger')

/**
 * Checks if the size is equal to expected size (from command).
 * Returns an object to use later if the size is less than expected.
 * In that case, the user has to send more data till it reach the expected size.
 */
function checkSize({command, data}) {
  logger.debug('checkSize', {command, data})
  const expectedSize = Number(command[4])
  const size = Buffer.byteLength(data, 'utf8')
  if(size == expectedSize) return 'OK'
  if(size > expectedSize) return 'CLIENT_ERROR bad data chunk'
  return { command, data: data + '\r\n' }
}

// Checks if the key exists and is not expired
function checkExpiration({command}, responseOnFail, responseOnPass) {
  logger.debug('checkExpiration', command)
  const key = command[1]
  const record = map.get(key)
  if(!record) return responseOnFail || 'NOT_STORED'
  if(Date.now() > record.expiration) {
    map.delete(key) // flush expired key
    return responseOnFail || 'NOT_STORED'
  }
  return responseOnPass || { record }
}

// Checks if the token corresponds to the key.
function validateCas({command, record}) {
  logger.debug('validateCas', command)
  const token = command[5]
  return token == record.cas_token ? 'OK' : 'EXISTS'
}

module.exports = { checkSize, checkExpiration, validateCas }