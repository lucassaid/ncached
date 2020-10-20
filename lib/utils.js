/**
 * Returns an object with the command (first line),
 * and some data (subsequent lines) if any.
 * `command` will likely have this structure: 
 * [<commandName>, <key>, <flags>, <exptime>, <bytes>]
 */
function parseBuffer(buffer) {
  for (let i = 0; i < buffer.length; i++) {
    // 13: \r, 10: \n
    const isBreakLine = buffer[i] == 13 && buffer[i + 1] == 10
    if (isBreakLine) {
      const line = buffer.toString('utf8', 0, i)
      const rest = buffer.toString('utf8', i + 2)
      return {
        command: line.trim().split(/\s+/),
        data: rest.trim(),
      }
    }
  }
  const line = buffer.toString('utf8')
  return { command: line.trim().split(/\s+/) }
}

/**
 * Validates every param in a given command.
 */
function validateFormat(command, format) {
  if(!format) return 'OK'

  // Check if this command has all the required params
  if(command.length < format.length) return 'ERROR'

  // Check the type of every parameter (only `number` available so far)
  for(let i = 1; i < format.length; i++) {
    const expectedType = format[i]
    if(expectedType == 'number' && isNaN(command[i])) {
      return 'CLIENT_ERROR bad command line format'
    }
  }
  return 'OK'
} 

module.exports = { parseBuffer, validateFormat }