'use strict';

var assert = require('assert');
var chromedriver = require('chromedriver');
var browser = require('../');

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
