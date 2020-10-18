const MAX_EXPIRATION = 60*60*24*30;

/*
 * This unique cas token will increase
 * every time a key is added or modified
*/
var unique_cas_token = 0


function handleRetrievalCommand({key, command, map}) {
  const { flags, size, data, cas_token } = map.get(key)
  let response = `VALUE ${key} ${flags} ${size}`
  // add token to response if command name is 'gets'
  if(command[0] == 'gets') response += ` ${cas_token}`
  return response + `\r\n${data}\r\nEND`
}

function handleStorageCommand({key, command, data, map}) {
  const recordParams = command.slice(2, command.length)
  const record = createRecord(recordParams, data)
  map.set(key, record)
  return 'STORED'
}

function handleAppendOrPrepend({key, command, data: newData, map}) {
  // according with memcached protocol, append and prepend commands
  // ignore expiration time and flags, so we use the previous ones
  const { data: previousData, expiration, flags } = map.get(key)

  if(command[0] == 'append') {
    var finalData = previousData + newData // append
  } else {
    var finalData = newData + previousData // prepend
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