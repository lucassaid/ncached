# ncached

## Installation

```bash
npm i -g ncached
```

## Usage

```bash
ncached
```

Using another port:

```bash
ncached -p 22222
```

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

To learn mor about how memcached commands work, have a look at this [guide](https://www.tutorialspoint.com/memcached/memcached_set_data.htm)

## Client examples

### Telnet

Connect to an ncached server via telnet:

```bash
telnet <server_ip> <server_port>
```

You can store and retreive data just as with a normal memcached server:
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

```bash
const Memcached = require('memcached');
const memcached = new Memcached('localhost:11212');

memcached.set('foo', 'bar', 20, (err) => { 
  // you can use 'gets' command to retreive the cas_token
  memcached.gets('foo', (err, data) => {
    // change value with 'cas' command
    memcached.cas('foo', 'redis', data.cas, 20))
  })
});
```

## Run tests

```bash
npm run test
```