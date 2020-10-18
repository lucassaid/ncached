const net = require('net')
const processData = require('./process')

/*
 * Main function, initializes server, and passes a handler for new connections.
*/
module.exports = async function initServer(port, callback = () => {}) {
  const server = net.createServer(connectionHandler)
  server.listen(port, callback)
  server.on('error', err => {
    console.log('Server error:', err)
    callback(err)
  })
}

/**
 * Handler for new connections.
*/
function connectionHandler(socket) {
  console.log('Client connected to server')

  socket.on('data', data => {
    /*
     * Process incoming data. The server will execute actions over the hashmap.
     * It will not make any changes in the hashmap if the command is a storage command
     * and the client didn't send data along with the command. In that case, it will
     * wait for the client to send data.
    */
    const result = processData(data, socket.info)

    // close connection
    if(result == 'quit') return socket.end()

    if(typeof result == 'string') {
      // clean socket info and respond
      socket.info = null
      socket.write(result + '\r\n')
    } else {
      /**
       * Every time result is not a string, the server will wait data from client,
       * we do this by saving some data inside the socket object.
       * User can then send data in one or more lines.
       */
      socket.info = { ...socket.info, ...result }
    }
  })

  socket.on('error', error => {
    console.log('Socket error: ', error)
    socket.end()
  })

  socket.on('end', () => {
    socket.info = null
    console.log('Client disconnected from server')
  })
}