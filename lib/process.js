const useHashMap = require('./hashmap')
const protocols = require('./protocols')
const { parseBuffer, validateFormat } = require('./utils')

function processData(buffer, savedInfo) {
  const handler = savedInfo ? processWithSavedInfo : processOnlyBuffer
  return handler(buffer, savedInfo)
}

function processWithSavedInfo(buffer, savedInfo) {
  const { command, data = '' } = savedInfo
  const newData = buffer.toString('utf8').trim()
  return useHashMap(command, data + newData)
}

function processOnlyBuffer(buffer) {
  const { command, data } = parseBuffer(buffer)
  const commandName = command[0]
  
  if(commandName == 'quit') return commandName

  // check if command exists
  const protocol = protocols[commandName]
  if(!protocol) return 'ERROR'

  // check if it is correct
  const formatValidation = validateFormat(command, protocol.format)
  if(formatValidation != 'OK') return formatValidation

  // check if it needs data
  if(protocol.needsData && !data) {
    return { command } // save command to store data later
  }

  // store or retreive data
  return useHashMap(command, data)
}

module.exports = processData
