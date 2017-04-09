[![Build Status](https://travis-ci.org/arenahito/instant-mock.svg?branch=master)](https://travis-ci.org/arenahito/instant-mock)
[![codecov](https://codecov.io/gh/arenahito/instant-mock/branch/master/graph/badge.svg)](https://codecov.io/gh/arenahito/instant-mock)
[![npm version](https://badge.fury.io/js/instant-mock.svg)](https://badge.fury.io/js/instant-mock)

# instant-mock

instant-mock is a quick and easy web API mock server.


## Installing globally

Installation via npm:

```sh
npm install -g instant-mock
```


## Usage

```sh
mkdir mymock
cd mymock
instant-mock init
instant-mock
```

You can open [http://localhost:3000](http://localhost:3000) to view the instant-mock console.

All mock API is mounted on [http://localhost:3000/mock](http://localhost:3000/mock).
Please try GET to [http://localhost:3000/mock/users](http://localhost:3000/mock/users) by curl or web browser. It is sample mock API created by ```instant-mock init```.


## Configuration

Servce configuration is wrote on ```server.yml```.

```yml
http:
  host: localhost
  port: 3000

socket:
  host: localhost
  port: 3010
```


## Creating your mocks

TBD
