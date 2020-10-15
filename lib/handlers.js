
const MAX_EXPIRATION = 60*60*24*30;

/*
 * This unique cas token will increase
 * every time a key is added or modified
*/
var unique_cas_token = 0


function handleRetrievalCommand({command, validationResult}) {
  const key = command[1]
  const { flags, size, data, cas_token } = validationResult
  let response = `VALUE ${key} ${flags} ${size}`
  // add token to response if command name is 'gets'
  if(command[0] == 'gets') response += ` ${cas_token}`
  return response + `\r\n${data}\r\nEND`
}

function handleStorageCommand({command, data, map}) {
  const recordParams = command.slice(2, command.length)
  const record = createRecord(recordParams, data)
  const key = command[1]
  map.set(key, record)
  return 'STORED'
}

function handleAppendOrPrepend({command, data: newData, map, validationResult}) {
  const key = command[1]

  // according with memcached protocol, append command ignores expiration time and flags
  const { data: previousData, expiration, flags } = validationResult

  let finalData
  if(command[0] == 'append') {
    finalData = previousData + newData // append
  } else {
    finalData = newData + previousData // prepend
  }

  // get new size
  const size = Buffer.byteLength(finalData, 'utf8')

  // create record and save it
  const recordParams = [flags, expiration, size]
  const record = createRecord(recordParams, finalData)
  map.set(key, record)
  return 'STORED'
}

function createRecord(recordParams, data) {
  const [flags, exptimeString, size] = recordParams

  // validate expiration time
  if(isNaN(exptimeString)) throw new Error('Invalid expiration time')

  const exptime = Number(exptimeString)

  // limit to max expiration if necessary
  const expiration = exptime <= MAX_EXPIRATION
    ? exptime * 1000 + Date.now()
    : MAX_EXPIRATION + Date.now()

  return {
    data,
    expiration,
    cas_token: unique_cas_token++,
    flags,
    size
  }
}

module.exports = {
  handleRetrievalCommand,
  handleStorageCommand,
  handleAppendOrPrepend,
}