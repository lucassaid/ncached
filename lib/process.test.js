const processCommand = require('./process')

const args = ['foo', '0', '20', '9']
const dataToStore = 'memcached'
const [key, flags, exptime, size] = args
const setCommand = `set ${key} ${flags} ${exptime} ${size}`
const socketInfo = { previousCommand: ['set', ...args] }

test('set command with data', () => {
  const buffer = Buffer.from(`${setCommand}\r\n${dataToStore}`)
  expect(processCommand(buffer)).toBe('STORED');
});

test('set command without data', () => {
  const buffer = Buffer.from(setCommand)
  expect(processCommand(buffer)).toEqual(socketInfo);
});

test('Receive data after a "set" command without data', () => {
  const buffer = Buffer.from(dataToStore)
  expect(processCommand(buffer, socketInfo)).toBe('STORED');
});

test('Get command', () => {
  const buffer = Buffer.from(`get ${key}`)
  expect(processCommand(buffer)).toMatch(`VALUE ${key} ${flags} ${size}\r\n${dataToStore}\r\nEND`)
})

test('Gets command', () => {
  const buffer = Buffer.from('gets foo')
  expect(processCommand(buffer)).toMatch(`VALUE ${key} ${flags} ${size} 1\r\n${dataToStore}\r\nEND`)
})

test('Cas command with data', () => {
  const casCommand = `cas ${key} ${flags} ${exptime} 5 1`
  const buffer = Buffer.from(`${casCommand}\r\nredis`)
  expect(processCommand(buffer)).toBe('STORED')
})

test('Cas command without data', () => {
  const casCommand = `cas ${key} ${flags} ${exptime} 5 2`
  const CasSocketInfo = { previousCommand: casCommand.split(' ') }
  const buffer = Buffer.from(casCommand)
  expect(processCommand(buffer)).toEqual(CasSocketInfo)
})

test('Receive data after a "cas" command without data', () => {
  const casCommand = `cas ${key} ${flags} ${exptime} 5 2`
  const CasSocketInfo = { previousCommand: casCommand.split(' ') }
  const buffer = Buffer.from('redis')
  expect(processCommand(buffer, CasSocketInfo)).toBe('STORED')
})