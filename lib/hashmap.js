const HashMap = require('hashmap');
const map = new HashMap();

function useHashMap(command, data, protocol) {
  // execute the validator for this command if any
  let validationResult = {}
  if(protocol.validator) {
    validationResult = protocol.validator(command, map)
    if(typeof validationResult == 'string' && validationResult != 'OK') {
      // validators will only return a string if they found an error
      return validationResult
    }
  }
  // run handler for this command
  return protocol.handler({command, data, map, validationResult})
}

module.exports = useHashMap