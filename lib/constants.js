module.exports = {
  ERROR: 'ERROR',
  BAD_DATA_CHUNK: 'CLIENT_ERROR bad data chunk',
  BAD_COMMAND_FORMAT: 'CLIENT_ERROR bad command line format',
  NOT_STORED: 'NOT_STORED',
  EXISTS: 'EXISTS',
  END: 'END',
  NOT_FOUND: 'NOT_FOUND',
  STORED: 'STORED',
  QUIT: 'quit',
  MAX_EXPIRATION = 60*60*24*30,
  retrievalCommandFormat: ['string', 'string'],
  storageCommandFormat: ['string', 'string', 'number', 'number', 'number'],
}