const map = require('./hashmap')
const MAX_EXPIRATION = 60*60*24*30
const logger = require('./logger')

// This token will increase every time a key is added or modified.
var unique_cas_token = 0

/**
 * Handles get and gets
 */
function handleRetrievalCommand({command, record}) {
  const [commandName, key] = command
  const { flags, size, data, cas_token } = record
  const token = commandName == 'get' ? `` : ` ${cas_token}`
  return `VALUE ${key} ${flags} ${size}${token}\r\n${data}\r\nEND`
}

/**
 * Handles most storage commands
 */
function handleStorageCommand({command, data}) {
  const [key, flags, exptime, size] = command.splice(1, 4)
  const record = createRecord(flags, exptime, size, data)
  logger.debug('Storing record: ', record)
  map.set(key, record)
  return 'STORED'
}

/**
 * Handles append and prepend.
 * According with memcached protocol, these commands ignore
 * expiration time and flag params, so we use the previous ones.
 */
function handleAppendOrPrepend({command, data: newData, record: savedRecord}) {
  const [commandName, key] = command
  const { data: previousData, expiration, flags } = savedRecord
  if(commandName == 'append') {
    var finalData = previousData + newData // append
  } else {
    var finalData = newData + previousData // prepend
  }
  // Create record and save it
  const size = Buffer.byteLength(finalData, 'utf8')
  const newCommand = [commandName, key, flags, expiration, size]
  return handleStorageCommand({command: newCommand, data: finalData})
}

/**
 * Creates a new record with the given params.
 * A record is just an object with all the data we need to store.
 */
function createRecord(flags, exptime, size, data) {
  exptime = Math.min(Number(exptime), MAX_EXPIRATION) // limit if necessary
  const expiration = exptime * 1000 + Date.now()
  const cas_token = unique_cas_token++
  return { flags, expiration, size, cas_token, data }
}

module.exports = {
  handleRetrievalCommand,
  handleStorageCommand,
  handleAppendOrPrepend,
}