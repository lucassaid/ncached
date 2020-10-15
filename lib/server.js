const net = require('net')
const processCommand = require('./process')

/*
 * simple object to map clients by their
 * remote address and store some info
*/
const sockets = {}

/* 
 * Main function, initializes server, and execute an optional callback.
 * The callback will be executed if the server fails too.
*/
module.exports = async function initServer(port, callback) {
  try {
    await init(port)
    callback && callback(null)
  } catch(err) {
    callback && callback(err)
  }
}

/*
 * Init server in the given port, and pass a handler for new connections,
*/
const init = port => {
  return new Promise((resolve, reject) => {
    const server = net.createServer(connectionHandler)
    server.listen(port, resolve)
    server.on('error', reject)
  })
}


/**
 * Handler for new connections. Every new remote address
 * is added to 'sockets' object to store some info later
*/
const connectionHandler = socket => {
  console.log('Client connected to server')
  
  const ipAddress = socket.remoteAddress
  sockets[ipAddress] = {}

  socket.on('data', data => {
    /*
     * Here we process incoming data. The server will execute actions over the hashmap.
     * It will not make any changes in the hashmap if the command is a storage command
     * and the client didn't send data in another line. In that case, it will
     * wait for the client to send data.
    */
    const result = processCommand(data, sockets[ipAddress])

    // close connection
    if(result == 'quit') return socket.end()

    if(typeof result == 'string') {
      // clean socket info and respond
      sockets[ipAddress] = {}
      socket.write(result + '\r\n')
    } else {
      // every time result is not a string, the server will wait data from client.
      // We do this by adding a 'previousCommand' prop to this socket's object, and we'll use
      // that command later to correctly store the data.
      sockets[ipAddress] = {
        previousCommand: result.previousCommand
      }
    }
  })

  socket.on('error', error => {
    console.log('Socket error: ', error);
    socket.end()
  })

  socket.on('end', () => {
    delete sockets[ipAddress]
    console.log('Client disconnected from server');
  })
}