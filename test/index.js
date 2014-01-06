'use strict';

var assert = require('assert');
var chromedriver = require('chromedriver');
var browser = require('../');

chromedriver.start();
browser.remote('http://localhost:9515/').timeout('60s').operationTimeout('20s');
after(function () {
  chromedriver.stop();
});

var getHeadingText = browser.async(function* (browser) {
  var heading = yield browser.elementByTagName('h1').text();
  return heading;
});

describe('www.example.com', function () {
  it('Has a header that reads "Example Domain"', browser(function* (browser) {
    yield browser.get('http://www.example.com');
    var heading = yield getHeadingText(browser);
    assert(heading.trim() == 'Example Domain');
  }));
});
