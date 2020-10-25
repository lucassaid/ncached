const protocols = require('./protocols')
const logger = require('./logger')
const { validateCommand } = require('./validators')

/**
 * Disambiguation depending on whether there is previous information or not.
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
  logger.verbose('processing new command')
  const { command, data } = parseBuffer(buffer)
  const commandValidation = validateCommand(command, protocols)
  if(!commandValidation.protocol) return commandValidation
  return executeCommand(command, data, commandValidation.protocol.handlers)
}

/**
 * Server has previous command to perform with this new data 
 */
function processWithSavedInfo(buffer, savedInfo) {
  logger.verbose('processing with savedInfo')
  const { command, data = '' } = savedInfo
  const protocol = protocols[command[0]]
  const newData = buffer.toString('utf8').trim()
  const finalData = data + newData
  return executeCommand(command, finalData, protocol.handlers)
}

/**
 * Every command has an array of handlers to execute, one after another.
 */
function executeCommand(command, data, handlers) {
  logger.verbose('Executing command:', {command, data})
  let record
  for(const handlerArr of handlers) {
    const params = { command, data, record }
    const [handler, responseOnFail, responseOnPass] = handlerArr
    const result = handler(params, responseOnFail, responseOnPass)
    if(result == 'OK') continue
    if(result.record) {
      record = result.record // save record for further handlers
      continue
    }
    // At this point `result` can be an error message from some handler,
    // the result of the last handler, or an object to store in the socket.
    return result
  }
}

/**
 * Returns an object with the command (first line) and the data, if any.
 * `command` will likely have this structure: 
 * [<commandName>, <key>, <flags>, <exptime>, <bytes>]
 */
function parseBuffer(buffer) {
  for (let i = 0; i < buffer.length; i++) {
    // 13: \r, 10: \n
    const isLineBreak = buffer[i] == 13 && buffer[i + 1] == 10
    if (isLineBreak) {
      return {
        command: parseChunk(buffer, [0, i], true),
        data: parseChunk(buffer, [i + 2])
      }
    }
  }
  // buffer doesn't has a line break, so theres only a command
  return { command: parseChunk(buffer, [], true) }
}

/**
 * Stringifies a buffer with a given position, and
 * splits it into an array if `split` param is true
 */
function parseChunk(buffer, position, split) {
  const str = buffer.toString('utf8', ...position).trim()
  return split ? str.split(/\s+/) : str
}

module.exports = processData