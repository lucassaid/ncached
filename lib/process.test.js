const processCommand = require('./process')

const args = ['foo', '0', '20', '9']
const dataToStore = 'memcached'
const [key, flags, exptime, size] = args
const setCommand = `set ${key} ${flags} ${exptime} ${size}`

const process = (string, socketInfo) => {
  const buffer = Buffer.from(string)
  return processCommand(buffer, socketInfo)
}

test('Non-existing command', () => {
  expect(process(`gett foo`)).toBe('ERROR')
})

test('Command with wrong format', () => {
  expect(process(`set foo 0 9 A`)).toBe('CLIENT_ERROR bad command line format')
})

test('Set command with data', () => {
  expect(process(`${setCommand}\r\n${dataToStore}`)).toBe('STORED')
})

test('Set command without data', () => {
  expect(process(setCommand)).toEqual({ command: ['set', ...args] })
})

test('Receive data after a "set" command without data', () => {
  expect(process(dataToStore, { command: ['set', ...args] })).toBe('STORED')
})

test('Set command with bad data chunk', () => {
  const command = `${setCommand}\r\n${dataToStore}_bar`
  expect(process(command)).toBe('CLIENT_ERROR bad data chunk')
})

test('Get command', () => {
  const expected = `VALUE ${key} ${flags} ${size}\r\n${dataToStore}\r\nEND`
  expect(process(`get ${key}`)).toMatch(expected)
})

test('Get non-existing or expired key', () => {
  expect(process(`get somekey`)).toMatch('END')
})

test('Gets command', () => {
  const expected = `VALUE ${key} ${flags} ${size} 1\r\n${dataToStore}\r\nEND`
  expect(process('gets foo')).toMatch(expected)
})

test('Cas command with data', () => {
  const casCommand = `cas ${key} ${flags} ${exptime} 5 1`
  expect(process(`${casCommand}\r\nredis`)).toBe('STORED')
})

test('Cas command without data', () => {
  const casCommand = `cas ${key} ${flags} ${exptime} 5 2`
  const CasSocketInfo = { command: casCommand.split(' ') }
  expect(process(casCommand)).toEqual(CasSocketInfo)
})

test('Cas command with wrong token', () => {
  const casCommand = `cas ${key} ${flags} ${exptime} 5 0`
  expect(process(`${casCommand}\r\nredis`)).toMatch('EXISTS')
})

test('Receive data after a "cas" command without data', () => {
  const casCommand = `cas ${key} ${flags} ${exptime} 5 2`
  const CasSocketInfo = { command: casCommand.split(' ') }
  expect(process('redis', CasSocketInfo)).toBe('STORED')
})

test('Replace command', () => {
  const command = `replace ${key} 0 90 3\r\nbar`
  expect(process(command)).toBe('STORED')
})

test('Replace command to a non-existing key', () => {
  const command = `replace somekey 0 90 3\r\nbar`
  expect(process(command)).toBe('NOT_STORED')
})

test('Add command', () => {
  const command = `add testing 0 90 3\r\nbar`
  expect(process(command)).toBe('STORED')
})

test('Add command to an existing key', () => {
  const command = `add ${key} 0 90 3\r\nbar`
  expect(process(command)).toBe('NOT_STORED')
})

test('Append command', () => {
  const command = `append ${key} 0 90 10\r\n_appending`
  expect(process(command)).toBe('STORED')
})

test('Prepend command', () => {
  const command = `append ${key} 0 90 11\r\n_prepending`
  expect(process(command)).toBe('STORED')
})
