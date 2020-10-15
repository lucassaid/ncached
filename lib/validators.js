/*
 * Validators will return 'OK' if the command is valid.
 * They will return an object if the command is valid and the data is useful
 * for the handler.
 * Otherwise they will return an error message.
*/

// returns the record if the key exists and is not expired
function validateGetOrGets(command, map) {
  const key = command[1]
  const record = map.get(key)
  if(!record) return ''
  if(Date.now() > record.expiration) {
    map.delete(key) // flush expired key
    return ''
  }
  return record
}


// returns 'OK' if the key doesn't exists
function validateAdd(command, map) {
  const key = command[1]
  return map.has(key) ? 'NOT_STORED' : 'OK'
}

// returns 'OK' if the key exists
function validateReplace(command, map) {
  const key = command[1]
  return map.has(key) ? 'OK' : 'NOT_STORED'
}

function validateAppendOrPrepend(command, map) {
  const record = map.get(command[1])
  if(!record) return 'NOT_STORED'
  return record
}

/*
 * returns 'OK' if this token corresponds to the key.
 * this will only happen if no one changed it,
 * since every change in the key generates a new token.
*/
function validateCas(command, map) {
  const key = command[1]
  const token = command[5]
  if(!token) return 'ERROR'
  const record = map.get(key)
  if(!record) return 'NOT_FOUND'
  if(token != record.cas_token) return 'EXISTS'
  return 'OK'
}

module.exports = {
  validateGetOrGets,
  validateAdd,
  validateReplace,
  validateAppendOrPrepend,
  validateCas,
}