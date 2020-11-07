const map = require('./hashmap')
const logger = require('./logger')
const { STORED, MAX_EXPIRATION } = require('./constants')

// This token will increase every time a key is added or modified.
var unique_cas_token = 0

/**
 * Handles get and gets
 * Retrieves the record and forms a response like:
 * VALUE <key> <flags> <size> [<cas_token>]
 * <data>
 * END
 */
function handleRetrievalCommand(command, _, record) {
  const [commandName, key] = command
  const { flags, size, data, cas_token } = record
  let firstLine = `${key} ${flags} ${size}`
  if(commandName == 'gets') firstLine += ` ${cas_token}`
  return `VALUE ${firstLine}\r\n${data}\r\nEND`
}

/**
 * Handles most storage commands
 * Creates a record from the given params, stores it
 * in the hashmap and returns `STORED`.
 */
function handleStorageCommand(command, data) {
  const [, key, flags, exptime, size] = command
  const record = createRecord(flags, exptime, size, data)
  logger.debug('Storing record: ', record)
  map.set(key, record)
  return STORED
}

/**
 * Handles append and prepend.
 * According with memcached protocol, these commands ignore
 * expiration time and flag params, so we use the previous ones.
 */
function handleAppendOrPrepend(command, newData, record) {
  const [commandName, key] = command
  const { data: previousData, expiration, flags } = record
  if(commandName == 'append') {
    var finalData = previousData + newData // append
  } else {
    var finalData = newData + previousData // prepend
  }
  // Create record and save it
  const size = Buffer.byteLength(finalData, 'utf8')
  const newCommand = [commandName, key, flags, expiration, size]
  return handleStorageCommand(newCommand, finalData)
}

/**
 * Creates a new record with the given params.
 * A record is just an object with all the data we need to store.
 */
function createRecord(flags, exptime, size, data) {
  // Limit expiration time to max expiration time if necessary
  exptime = Math.min(Number(exptime), MAX_EXPIRATION)
   
  const expiration = exptime * 1000 + Date.now()
  const cas_token = unique_cas_token++
  return { flags, expiration, size, cas_token, data }
}

module.exports = {
  handleRetrievalCommand,
  handleStorageCommand,
  handleAppendOrPrepend,
}