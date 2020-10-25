const net = require('net')
const logger = require('./logger')
const processData = require('./process')

/**
 * Main function. It initializes the server, and passes a handler for new connections.
 */
module.exports = function initServer(port, callback = () => {}) {
  const server = net.createServer(connectionHandler)
  server.listen(port, callback)
  server.on('error', err => {
    logger.error('Server error: ' + err)
    callback(err)
  })
}

/**
 * Handler for new connections.
 */
function connectionHandler(socket) {
  logger.info('Client connected from: ' + socket.remoteAddress)

  socket.on('data', data => handleData(data, socket))

  socket.on('error', error => {
    socket.end()
    logger.error('Socket error: ' + error)
  })

  socket.on('end', () => {
    socket.info = null
    logger.info('Client disconnected from server')
  })
}

/**
 * Process incoming data. The server may execute actions over the hashmap.
 * It will not make any changes in the hashmap if the command is a storage command
 * and the client didn't send data along with the command, or if the size is less
 * than expected. In that case, it will wait for more data.
 */
function handleData(data, socket) {
  logger.verbose('Received data: ' + data)
  
  const result = processData(data, socket.info)

  if(result == 'quit') {
    return socket.end()
  }

  /**
   * Every time result is not a string, the server will wait data from client,
   * we do this by saving some information inside the socket object.
   * Client can then send data in one or more lines.
   */
  if(typeof result == 'string') {
    socket.info = null
    socket.write(result + '\r\n')
    logger.verbose('Socket responded with: ' + result)
  } else {
    socket.info = { ...socket.info, ...result }
    logger.verbose('Saved socket info: ', socket.info)
  }
}