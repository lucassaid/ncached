const protocols = require('./protocols')
const logger = require('./logger')
const map = require('./hashmap')

const { 
  validateCommandLength, 
  validateFormat,
} = require('./validators')

const {
  ERROR,
  BAD_COMMAND_FORMAT,
  BAD_DATA_CHUNK,
  QUIT
} = require('./constants')

/**
 * Interprets the incoming buffer and executes the required command. 
 * Obtains command and data from the saved info if any, or from the buffer.
 * If there is saved info, it'll add the incoming buffer to the previous data.
 */
function processData(buffer, savedInfo) {
  let { command, data = '' } = savedInfo || interpretBuffer(buffer)
  if(savedInfo) data += parseChunk(buffer)
  logger.verbose('Processing buffer:', { command, data })
  const [commandName, key] = command
  const protocol = protocols[commandName]

  // Validate new command
  // !savedInfo means there isn't any previous data of this
  // client, thus the server expects a new valid command.
  if(!savedInfo) {
    try {
      checkCommand(command, protocol)
    } catch(err) {
      return err.message
    }
  }

  // Validate data (existence and size)
  if(protocol.validateData) {
    const dataCheck = checkDataAndSize(command, data)
    if(dataCheck != true) return dataCheck
  }

  // Get record. It may not exist, we validate it later 
  const record = map.get(key)

  // Every command has an array of validators to execute.
  for (const validatorArr of protocol.validators) {
    const [validator, response] = validatorArr
    if(!validator(command, record)) {
      return response
    }
  }

  // Handle command and return
  return protocol.handler(command, data, record)
}

/**
 * Checks if command is `quit`, if the protocol exists,
 * and if the length and format are correct.
 */
function checkCommand(command, protocol) {
  if(command[0] == QUIT) throw new Error(QUIT)
  if(!protocol) throw new Error(ERROR)
  const validLength = validateCommandLength(command, protocol.format)
  if(!validLength) throw new Error(ERROR)
  const validFormat = validateFormat(command, protocol.format)
  if(!validFormat) throw new Error(BAD_COMMAND_FORMAT)
}

/**
 * Checks if the given data matches in size with the expected size.
 * If it doesn't match, checks if it is less or more.
 */
function checkDataAndSize(command, data) {
  // If there is no data, save the command and wait for more data.
  if(data == '') return { command }

  // Check if size is equal to expected
  const expectedSize = Number(command[4])
  const size = Buffer.byteLength(data, 'utf8')
  if(size == expectedSize) return true

  // Size is not equal to expected, but it may be less. In that
  // case, save command, existent data, and wait for more data.
  return size < expectedSize
    ? { command, data: data + '\r\n' }
    : BAD_DATA_CHUNK // more than expected
}

/**
 * Returns an object with the command (first line) and the data, if any.
 * `command` will likely have this structure: 
 * [<commandName>, <key>, <flags>, <exptime>, <bytes>]
 */
function interpretBuffer(buffer) {
  // search for a line break ---> \r\n
  for (let i = 0; i < buffer.length; i++) {
    const character = buffer[i]
    const nextCharacter = buffer[i + 1]
    /**
     * Check if character is \r (13 in hexadecimal)
     * and next character is \n (10 in hexadecimal)
     */
    const isLineBreak = character == 13 && nextCharacter == 10
    if (isLineBreak) {
      // command is the buffer from first character to line break
      const command = parseChunk(buffer, [0, i], true)
      // data is the buffer from line break to end
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