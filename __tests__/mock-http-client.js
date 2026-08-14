'use strict'
// Preload via NODE_OPTIONS=--require to mock @actions/http-client in a subprocess.
// Returns the java fixture without making a real HTTP request.
const Module = require('module')
const path = require('path')

const fixture = require(path.join(__dirname, 'fixtures', 'java.json'))

const originalLoad = Module._load
Module._load = function (request, parent, isMain) {
  if (request === '@actions/http-client') {
    return {
      HttpClient: class {
        getJson() {
          return Promise.resolve({statusCode: 200, result: fixture, headers: {}})
        }
      }
    }
  }
  return originalLoad.apply(this, arguments)
}
