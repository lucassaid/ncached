/**
 * Returns an object with command (first line)
 * and data (subsequent lines) if any
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

function validateFormat(command, format) {
  if(!format) return 'OK'

  // check if this command has all the requried params
  if(command.length < format.length) return 'ERROR'

  // check the type of every parameter
  const msg = 'CLIENT_ERROR bad command line format'
  for(let i = 1; i < format.length; i++) {
    const expectedType = format[i]
    if(expectedType == 'number' && isNaN(command[i])) {
      return msg
    }
  }
  return 'OK'
} 

module.exports = { parseBuffer, validateFormat }