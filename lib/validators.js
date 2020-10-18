/*
 * Validators will return 'OK' if the command is valid.
*/


/**
 * Returns 'OK' only if the size is equal to expected size (from command).
 * Returns an object to use later if the size is less than expected.
 * In that case, the user has to send more data till it reach the expected size.
 */
function validateSize({command, data}) {
  const expectedSize = Number(command[4])
  const size = Buffer.byteLength(data, 'utf8')
  if(size == expectedSize) return 'OK'
  if(size > expectedSize) return 'CLIENT_ERROR bad data chunk'
  if(size < expectedSize) return {command, data: data + '\r\n'}
}

// Returns 'OK' if the key exists and is not expired
function validateGetOrGets({key, map}) {
  const record = map.get(key)
  if(!record) return ''
  if(Date.now() > record.expiration) {
    map.delete(key) // flush expired key
    return ''
  }
  return 'OK'
}


// returns 'OK' if the key doesn't exists
function doesntExists({key, map}) {
  return map.has(key) ? 'NOT_STORED' : 'OK'
}

// returns 'OK' if the key exists
function exists({key, map}) {
  return map.has(key) ? 'OK' : 'NOT_STORED'
}

/*
 * returns 'OK' if this token corresponds to the key.
 * this will only happen if no one changed it,
 * since every change in the key generates a new token.
*/
function validateCas({key, command, map}) {
  const token = command[5]
  const record = map.get(key)
  if(!record) return 'NOT_FOUND'
  if(token != record.cas_token) return 'EXISTS'
  return 'OK'
}

module.exports = {
  validateSize,
  validateGetOrGets,
  doesntExists,
  exists,
  validateCas,
}