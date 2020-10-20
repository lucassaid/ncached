const net = require('net')
const logger = require('./logger')
const processData = require('./process')

/**
 * Main function, initializes server, and passes a handler for new connections.
 */
module.exports = async function initServer(port, callback = () => {}) {
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

  socket.on('data', data => {
    logger.verbose('Received data: ' + data)
    /*
     * Process incoming data. The server will execute actions over the hashmap.
     * It will not make any changes in the hashmap if the command is a storage command
     * and the client didn't send data along with the command, or if the size is less
     * than expected. In that case, it will wait for more data.
    */
    const result = processData(data, socket.info)

    if(result == 'quit') {
      return socket.end() // close connection
    }

    if(typeof result == 'string') {
      // clean socket info and respond
      socket.info = null
      socket.write(result + '\r\n')
      logger.verbose('Socket responded with: ' + result)
    } else {
      /**
       * Every time result is not a string, the server will wait data from client,
       * we do this by saving some data inside the socket object.
       * User can then send data in one or more lines.
       */
      socket.info = { ...socket.info, ...result }
      logger.verbose('Saved socket info: ', socket.info)
    }
  })

  socket.on('error', error => {
    logger.error('Socket error: ' + error)
    socket.end()
  })

  socket.on('end', () => {
    socket.info = null
    logger.info('Client disconnected from server')
  })
}