# NCached
NCached is a Memcached-compatible server written in node.js

## Installation
Install globally using npm:
```bash
npm i -g ncached
```

## Usage
Start the server from the command line:
```bash
ncached
```

### Server options
| Flag | Description | Default value |
| :---: | :---: | :---: |
| -p | Port where the server will listen for new clients | 11212 |
| -l | Logger level. Available options: `error`, `info`, `verbose`, `debug` | info |

## Available commands

Retrieval commands:
* get
* gets

Storage commands:
* set
* add
* replace
* append
* prepend
* cas

To learn more about how memcached commands work, have a look at this [guide](https://www.tutorialspoint.com/memcached/memcached_set_data.htm)

## Client examples

### Telnet

Connect to an NCached server via telnet:

```bash
telnet <server_ip> <server_port>
```

You can store and retrieve data just as with a normal memcached server:
```bash
set foo 0 20 3
bar
```
And then:
```bash
get foo
```

Will return:
```bash
VALUE foo 0 3
bar
END
```

### Memcached client for node

Using [memcached](https://www.npmjs.com/package/memcached) library:

```js
const Memcached = require('memcached')
const memcached = new Memcached('localhost:11212')

memcached.set('foo', 'bar', 20, (err) => { 
  // you can use 'gets' command to retrieve the cas_token
  memcached.gets('foo', (err, data) => {
    // change value with 'cas' command
    memcached.cas('foo', 'redis', data.cas, 20, err => { /* stuff */ })
  })
})
```

## Run tests

```bash
npm run test
```