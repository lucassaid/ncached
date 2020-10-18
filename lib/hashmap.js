const HashMap = require('hashmap');
const map = new HashMap();
const protocols = require('./protocols')

function useHashMap(command, data) {
  const [commandName, key] = command
  const protocol = protocols[commandName]
  const validators = protocol.validators || []

  for(const validator of validators) {
    const validation = validator({key, command, data, map})
    // validator found an error, or there is an object to save
    if(validation != 'OK') return validation
  }

  // run handler for this command
  return protocol.handler({key, command, data, map})
}

module.exports = useHashMap