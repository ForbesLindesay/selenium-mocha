'use strict';

var assert = require('assert');
var chromedriver = require('chromedriver');
var browser = require('../');

var LOCAL = !process.env.CI;

if (LOCAL) {
  chromedriver.start();
  browser.remote('http://localhost:9515/').timeout('60s').operationTimeout('5s');
  after(function () {
    chromedriver.stop();
  });
} else {
  browser.remote('ondemand.saucelabs.com', 80, 'sauce-runner', 'c71a5c75-7c28-483f-9053-56da13b40bc2').timeout('240s').operationTimeout('30s');
}

var getHeadingText = browser.async(function* (browser) {
  var heading = yield browser.elementByTagName('h1').text();
  return heading;
});

describe('www.example.com', function () {
  it('Has a header that reads "Example Domain"', browser(function* (browser) {
    console.log('getting url');
    yield browser.get('http://www.example.com');
    console.log('getting heading text');
    var heading = yield getHeadingText(browser);
    console.log('checking heading text');
    assert(heading.trim() == 'Example Domain');
  }));
});
