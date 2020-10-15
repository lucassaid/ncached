const useHashMap = require('./hashmap')
const protocols = require('./protocols')

function processCommand(buffer, socketInfo = {}) {
  const { line, rest } = parseBuffer(buffer)
  const { command, data } = getCommandAndData(line, rest, socketInfo)
  const commandName = command[0]

  if(commandName == 'quit') return commandName

  // check if command exists
  const protocol = protocols[commandName]
  if(!protocol) return 'ERROR'

  // check if this command needs data
  if(!data && protocol.needsData) {
    return { previousCommand: command } // make server wait
  }

  return useHashMap(command, data, protocol)
}

/**
 * TODO explicar bien aca
 */
const getCommandAndData = (line, rest, socketInfo) => {
  // use previously saved command, or use first line
  const command = socketInfo.previousCommand || line.trim().split(/\s+/)
  const data = socketInfo.previousCommand ? line : rest
  return { command, data: data && data.trim() }
}

/* Returns an object with the parsed buffer,
 * sparating line from the rest (data)
 * snippet from nodecached library
*/
const parseBuffer = (buffer) => {
  for (let i = 0; i < buffer.length; i++) {
    // 13: \r, 10: \n
    const isBreakLine = buffer[i] == 13 && buffer[i + 1] == 10
    if(isBreakLine) {
      return {
        line: buffer.toString('utf8', 0, i),
        rest: buffer.toString('utf8', i + 2),
      }
    }
  }
  return { line: buffer.toString('utf8') }
}

module.exports = processCommand
