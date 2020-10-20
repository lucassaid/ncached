const map = require('./hashmap')
const MAX_EXPIRATION = 60*60*24*30;
const logger = require('./logger')

/*
 * This unique cas token will increase
 * every time a key is added or modified
*/
var unique_cas_token = 0

// Handles get and gets
function handleRetrievalCommand({command, record}) {
  const [commandName, key] = command
  const { flags, size, data, cas_token } = record
  let response = `VALUE ${key} ${flags} ${size}`
  if(commandName == 'gets') response += ` ${cas_token}`
  return response + `\r\n${data}\r\nEND`
}

// Handles most storage commands
function handleStorageCommand({command, data}) {
  const [name, key, flags, exptime, size] = command
  const record = createRecord(flags, exptime, size, data)
  logger.debug('Storing record: ', record)
  map.set(key, record)
  return 'STORED'
}

/**
 * Handles append and prepend
 * according with memcached protocol, these commands ignore
 * expiration time and flag params, so we use the previous ones
 */
function handleAppendOrPrepend({command, data: newData, record: savedRecord}) {
  const { data: previousData, expiration, flags } = savedRecord
  if(command[0] == 'append') {
    var finalData = previousData + newData // append
  } else {
    var finalData = newData + previousData // prepend
  }
  
  // create record and save it
  const size = Buffer.byteLength(finalData, 'utf8')
  const newCommand = ['', command[1], flags, expiration, size]
  return handleStorageCommand({command: newCommand, data: finalData})
}

function createRecord(flags, exptime, size, data) {
  // limit to max expiration if necessary
  exptime = Number(exptime)
  if(exptime > MAX_EXPIRATION) {
    exptime = MAX_EXPIRATION 
  }

  const expiration = exptime * 1000 + Date.now()
  const cas_token = unique_cas_token++
  return { data, expiration, cas_token, flags, size }
}

module.exports = {
  handleRetrievalCommand,
  handleStorageCommand,
  handleAppendOrPrepend,
}