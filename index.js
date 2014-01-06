'use strict';

'use strict';

//don't use libraries like assert directly with the browser tests because all
//the browser methods actually return promises, not real objects.

var Promise = require('promise');
var wd = require('wd');
var ms = require('ms');

var remotes = [];
var settings = {};

module.exports = browser;
module.exports.remote = remote;
module.exports.timeout = timeout;
module.exports.operationTimeout = operationTimeout;
module.exports.async = async;

function remote() {
  remotes = Array.prototype.slice.call(arguments);
  remotes.push('promiseChain');
  return this;
}
function timeout(timeout) {
  settings.timeout = timeout;
  return this;
}
function operationTimeout(timeout) {
  settings.operationTimeout = timeout;
  return this;
}
function lazy() {
  settings.lazy = true;
}
function browser(fn, options) {
  options = options || {};
  if (options.lazy === undefined) options.lazy = settings.lazy;
  if (options.timeout === undefined) options.timeout = settings.timeout;
  if (options.operationTimeout === undefined) options.operationTimeout = settings.operationTimeout;

  if (options.lazy === undefined && (process.argv.indexOf('-g') !== -1 || process.argv.indexOf('--grep') !== -1)) options.lazy = true;
  var result;
  var timedOut = false;
  var operationTimeout;
  var onOperationTimeout = function () { timedOut = true; };

  function resetOperationTimeout() {
    if (operationTimeout) clearTimeout(operationTimeout);
    if (options.operationTimeout) {
      operationTimeout = setTimeout(function () {
        onOperationTimeout();
      }, ms(options.operationTimeout.toString()));
    }
  }

  function execute() {
    resetOperationTimeout();
    var browser = wd.remote.apply(wd, remotes);
    result = browser.init().then(async(fn.bind(this, browser), resetOperationTimeout)).then(function () {
      return browser.quit();
    }, function (err) {
      browser.quit();
      if (err.data) {
        err.message +=  err.data + '\n';
      }
      throw err;
    });
  }
  if (!options.lazy) execute();
  return function (done) {
    var self = this;
    if (options.timeout && self.timeout) {
      self.timeout(options.timeout);
    }
    if (options.operationTimeout) {
      onOperationTimeout = function () {
        self.timedOut = true;
        done(new Error('operation timeout of ' + ms(operationTimeout.toString()) + 'ms exceeded'));
      };
      if (timedOut) return onOperationTimeout();
    }
    if (!result) execute();
    result.nodeify(done);
  }
}


function async(makeGenerator, resetTimeout){
  return function (){
    var rt = resetTimeout;
    var generator = makeGenerator.apply(this, arguments);

    function setResetTimeoutMethod(method) {
      rt = method;
    }

    function handle(result){ // { done: [Boolean], value: [Object] }
      if (result.done) return Promise.from(result.value);
      if (result.value && typeof result.value.setResetTimeoutMethod === 'function') {
        result.value.setResetTimeoutMethod(rt);
        finalResult.setResetTimeoutMethod = function (method) {
          setResetTimeoutMethod(method);
          result.value.setResetTimeoutMethod(method);
        };
      }
      return Promise.from(result.value).then(function (res){
        if (rt) rt();
        finalResult.setResetTimeoutMethod = setResetTimeoutMethod;
        return handle(generator.next(res));
      }, function (err){
        finalResult.setResetTimeoutMethod = setResetTimeoutMethod;
        return handle(generator.throw(err));
      });
    }

    var finalResult = handle(generator.next());
    finalResult.setResetTimeoutMethod = setResetTimeoutMethod;
    return finalResult;
  }
}
