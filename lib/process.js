const protocols = require('./protocols')
const logger = require('./logger')
const { validateCommand } = require('./validators')

/**
 * Interprets the incoming buffer and executes the required command. 
 * Obtains command and data from the saved info if any, or from the buffer.
 * If there is saved info, it'll add the incoming buffer to the previous data.
 */
function processData(buffer, savedInfo) {
  let { command, data = '' } = savedInfo || interpretBuffer(buffer)
  if(savedInfo) data += parseChunk(buffer)
  const commandName = command[0]
  const protocol = protocols[commandName]
  if (!savedInfo) {
    // Validate new command
    const commandValidation = validateCommand(command, protocol)
    if (commandValidation != 'OK') return commandValidation
  }
  return executeCommand(command, data, protocol.handlers)
}

/**
 * Every command has an array of handlers to execute, one after another.
 */
function executeCommand(command, data, handlers) {
  logger.verbose('Executing command:', { command, data })
  let params = { command, data }
  for (const handlerArr of handlers) {
    const [handler, responseOnFail, responseOnPass] = handlerArr
    const result = handler(params, responseOnFail, responseOnPass)
    if(result == 'OK') continue
    if(result.record) {
      params.record = result.record // save record for further handlers
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
function interpretBuffer(buffer) {
  for (let i = 0; i < buffer.length; i++) {
    // 13: \r, 10: \n
    const isLineBreak = buffer[i] == 13 && buffer[i + 1] == 10
    if (isLineBreak) {
      const command = parseChunk(buffer, [0, i], true)
      const data = parseChunk(buffer, [i + 2])
      return { command, data }
    }
  }
  // buffer doesn't has a line break, so theres only a command
  return { command: parseChunk(buffer, [], true) }
}

/**
 * Stringifies a buffer with a given position, and
 * splits it into an array if `split` param is true
 */
function parseChunk(buffer, position = [], split) {
  const str = buffer.toString('utf8', ...position).trim()
  return split ? str.split(/\s+/) : str
}

module.exports = processData