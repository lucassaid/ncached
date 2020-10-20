const protocols = require('./protocols')
const logger = require('./logger')
const { parseBuffer, validateFormat } = require('./utils')

/**
 * Disambiguation depending on whether
 * there is previous information or not.
 */ 
function processData(buffer, savedInfo) {
  const handler = savedInfo ? processWithSavedInfo : processNewCommand
  return handler(buffer, savedInfo)
}

/**
 * Server hasn't any previous information from this client,
 * thus will expect a new valid command.
 */
function processNewCommand(buffer) {
  const { command, data } = parseBuffer(buffer)
  logger.verbose('Command: ' + command)
  logger.verbose('Data: ' + data)

  const commandName = command[0]
  if(commandName == 'quit') return commandName

  // Check if command exists
  const protocol = protocols[commandName]
  if(!protocol) return 'ERROR'

  // Check if format is correct
  const formatValidation = validateFormat(command, protocol.format)
  if(formatValidation != 'OK') return formatValidation

  // Check if command needs data
  if(protocol.needsData && !data) {
    return { command } // save command to wait for more data
  }

  return executeCommand(command, data, protocol.handlers)
}

/**
 * Server has previous command to perform with this new data 
 */
function processWithSavedInfo(buffer, savedInfo) {
  logger.verbose('Using savedInfo: ' + savedInfo)
  const { command, data = '' } = savedInfo
  
  const protocol = protocols[command[0]]
  const newData = buffer.toString('utf8').trim()
  const finalData = data + newData
  
  logger.verbose('Data: ' + finalData)
  return executeCommand(command, finalData, protocol.handlers)
}

/**
 * Every command has an array of handlers to execute,
 * one after another.
 */
function executeCommand(command, data, handlers) {
  let record
  for(const handlerArr of handlers) {
    const params = { command, data, record }
    const [handler, responseOnFail, responseOnPass] = handlerArr
    const result = handler(params, responseOnFail, responseOnPass)
    if(result == 'OK' || result.record) {
      // save record for further handlers
      if(result.record) record = result.record
      continue
    }
    /** 
     * At this point `result` can be:
     * - The result of the last handler for this protocol
     * - An error message from some handler
     * - An object to store in socket
     */
    return result
  }
}

module.exports = processData