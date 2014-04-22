# selenium-mocha

run selenium tests in the browser using generators and mocha

[![Build Status](https://img.shields.io/travis/ForbesLindesay/selenium-mocha/master.svg)](https://travis-ci.org/ForbesLindesay/selenium-mocha)
[![Dependency Status](https://img.shields.io/gemnasium/ForbesLindesay/selenium-mocha.svg)](https://gemnasium.com/ForbesLindesay/selenium-mocha)
[![NPM version](https://img.shields.io/npm/v/selenium-mocha.svg)](http://badge.fury.io/js/selenium-mocha)

## Installation

    npm install selenium-mocha

## Usage

For full example see "test" folder.  A fresh browser is automatically created and disposed of for each test case.  Each test case runs in parallel by default (unless you use `--grep` which forces it into serial operation).

```js
'use strict';

var assert = require('assert');
var chromedriver = require('chromedriver');
var browser = require('selenium-mocha');

chromedriver.start();
browser.remote('http://localhost:9515/').timeout('60s').operationTimeout('5s');
after(function () {
  chromedriver.stop();
});

describe('www.example.com', function () {
  it('Has a header that reads "Example Domain"', browser(function* (browser) {
    yield browser.get('http://www.example.com');
    var heading = yield browser.elementByTagName('h1').text();
    assert(heading.trim() == 'Example Domain');
  }));
});
```

Initialization.  Configure the following settings:

```js
//configure how to connect to the remote using the same arguments as `wd.remote`
browser.remote(...args);

//set a timeout for all browser test cases
browser.timeout('60s');

//set a timeout that gets reset once each `yield` statement completes
browser.operationTimeout('5s');

//optionaly force all tests to evaluate in sequence (this is typically much slower)
browser.lazy();
```

You can also pass any of those as options.

## Enabling generators

To enable generators, install gnode via `npm install gnode --save-dev` then enable them by creating a `mocha.otps` file in the unit tests folder with the following body:

```
--require gnode
```

This will precompile files using facebook's regenerator.

## License

  MIT
