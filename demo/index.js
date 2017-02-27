(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var request = require('basic-browser-request');
var GetSpotifySample = require('../index');
var handleError = require('handle-error-web');

var getSpotifySample;
var sourceNode;

((function go() {
  getSpotifySample = GetSpotifySample({
    request: request
  });
  wireButton();
})());

function wireButton() {
  var button = document.querySelector('.get-audio-button');
  button.addEventListener('click', getAudioForTrack);
}

function getAudioForTrack() {
  var uri = document.querySelector('.track-field').value;
  getSpotifySample(uri, playAudio);
}

function playAudio(error, buffer) {
  if (error) {
    handleError(error);
  }
  else {
    var audioContext = new AudioContext();
    audioContext.decodeAudioData(buffer, playBuffer);
  }

  function playBuffer(decodedBuffer) {
    if (sourceNode) {
      sourceNode.stop();
    }
    sourceNode = audioContext.createBufferSource();
    // var pannerNode = audioContext.createStereoPanner();

    // pannerNode.connect(audioContext.destination);
    // sourceNode.connect(pannerNode);
    sourceNode.connect(audioContext.destination);

    // pannerNode.pan.value = pan;

    sourceNode.buffer = decodedBuffer;
    sourceNode.loop = true;
    // sourceNode.loopStart = 2.98;
    // sourceNode.loopEnd = 3.80;
    // sourceNode.playbackRate.value = rate;

    sourceNode.start();
  }
}

},{"../index":2,"basic-browser-request":3,"handle-error-web":6}],2:[function(require,module,exports){
var SpotifyResolve = require('spotify-resolve');
var sb = require('standard-bail')();

function GetSpotifySample(opts) {
  var request;
  if (opts) {
    request = opts.request;
  }
  var spResolve = SpotifyResolve({request: request});

  return getSpotifySample;

  function getSpotifySample(uri, getSampleDone) {
    var trackURI = uri;
    if (!uri.startsWith('spotify:track:')) {
      trackURI = 'spotify:track:' + uri;
    }
    spResolve(trackURI, sb(fetchBuffer, getSampleDone));

    function fetchBuffer(track) {
      if (!track || !track.preview_url) {
        getSampleDone(new Error('No sample available for track: ' + trackURI));
      }
      else {
        var reqOpts = {
          method: 'GET',
          url: track.preview_url,
          binary: true,
          encoding: null
        };
        request(reqOpts, sb(passBuffer, getSampleDone));
      }
    }

    function passBuffer(res, body) {
      getSampleDone(null, body);
    }
  }
}

module.exports = GetSpotifySample;

},{"spotify-resolve":9,"standard-bail":11}],3:[function(require,module,exports){
function createRequestMaker() {
  // WARNING: onData does NOT work with binary data right now!

  function makeRequest(opts, done) {
    var jsonMode = (opts.json || opts.mimeType === 'application/json');

    var xhr = new XMLHttpRequest();
    xhr.open(opts.method,  opts.url);
    if (opts.mimeType) {
      xhr.setRequestHeader('content-type', opts.mimeType);
    }
    if (jsonMode) {
      xhr.setRequestHeader('accept', 'application/json');
    }

    if (typeof opts.headers === 'object') {
      for (var headerName in opts.headers) {
        xhr.setRequestHeader(headerName, opts.headers[headerName]);
      }
    }

    if (opts.binary) {
      xhr.responseType = 'arraybuffer';
    }

    if (jsonMode && typeof opts.body === 'object') {
      opts.body = JSON.stringify(opts.body);
    }

    var timeoutKey = null;

    xhr.onload = function requestDone() {
      clearTimeout(timeoutKey);
      
      if (this.status >= 200 || this.status < 300) {
        var responseObject = {
          statusCode: this.status,
          statusMessage: xhr.statusText,
          rawResponse: xhr.response
        };

        if (opts.binary) {
          done(null, responseObject, xhr.response);
        }
        else {
          var resultObject = this.responseText;
          if (jsonMode) {
            resultObject = JSON.parse(resultObject);
          }
          done(null, responseObject, resultObject);
        }
      }
      else {
        done(new Error('Error while making request. XHR status: ' + this.status), xhr.response);
      }
    };

    var lastReadIndex = 0;
    if (opts.onData) {
      xhr.onreadystatechange = stateChanged;
    }
   
    xhr.send(opts.formData || opts.body);

    if (opts.timeLimit > 0) {
      timeoutKey = setTimeout(cancelRequest, opts.timeLimit);
    }

    function cancelRequest() {
      xhr.abort();
      clearTimeout(timeoutKey);
      done(new Error('Timed out'));
    }

    function stateChanged() {
      if (xhr.readyState === 3) {
        opts.onData(this.responseText.substr(lastReadIndex));
        lastReadIndex = this.responseText.length;
      }
    }

    return {
      url: opts.url,
      cancelRequest: cancelRequest
    };
  }

  return {
    makeRequest: makeRequest
  };
}

if (typeof module === 'object' && typeof module.exports === 'object') {
  var requestMaker = createRequestMaker();
  module.exports = requestMaker.makeRequest;
}

},{}],4:[function(require,module,exports){
(function (process){
var sliceCall = Array.prototype.slice.call;

// Expecting params cb, error, result1, result2, ...
function makeCallbackCaller(cb) {
	var paramsForCallback = Array.prototype.slice.call(arguments, 1);

	return function callbackCall() {
		cb.apply(cb, paramsForCallback);
	};
}

// Expecting params cb, error, result1, result2, ...
function callNextTick() {
	var caller = makeCallbackCaller.apply(
		null, Array.prototype.slice.call(arguments, 0)
	);
	process.nextTick(caller);
}

module.exports = callNextTick;

}).call(this,require('_process'))
},{"_process":7}],5:[function(require,module,exports){
// https://d3js.org/d3-queue/ Version 3.0.3. Copyright 2016 Mike Bostock.
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.d3 = global.d3 || {})));
}(this, (function (exports) { 'use strict';

var slice = [].slice;

var noabort = {};

function Queue(size) {
  if (!(size >= 1)) throw new Error;
  this._size = size;
  this._call =
  this._error = null;
  this._tasks = [];
  this._data = [];
  this._waiting =
  this._active =
  this._ended =
  this._start = 0; // inside a synchronous task callback?
}

Queue.prototype = queue.prototype = {
  constructor: Queue,
  defer: function(callback) {
    if (typeof callback !== "function" || this._call) throw new Error;
    if (this._error != null) return this;
    var t = slice.call(arguments, 1);
    t.push(callback);
    ++this._waiting, this._tasks.push(t);
    poke(this);
    return this;
  },
  abort: function() {
    if (this._error == null) abort(this, new Error("abort"));
    return this;
  },
  await: function(callback) {
    if (typeof callback !== "function" || this._call) throw new Error;
    this._call = function(error, results) { callback.apply(null, [error].concat(results)); };
    maybeNotify(this);
    return this;
  },
  awaitAll: function(callback) {
    if (typeof callback !== "function" || this._call) throw new Error;
    this._call = callback;
    maybeNotify(this);
    return this;
  }
};

function poke(q) {
  if (!q._start) {
    try { start(q); } // let the current task complete
    catch (e) {
      if (q._tasks[q._ended + q._active - 1]) abort(q, e); // task errored synchronously
      else if (!q._data) throw e; // await callback errored synchronously
    }
  }
}

function start(q) {
  while (q._start = q._waiting && q._active < q._size) {
    var i = q._ended + q._active,
        t = q._tasks[i],
        j = t.length - 1,
        c = t[j];
    t[j] = end(q, i);
    --q._waiting, ++q._active;
    t = c.apply(null, t);
    if (!q._tasks[i]) continue; // task finished synchronously
    q._tasks[i] = t || noabort;
  }
}

function end(q, i) {
  return function(e, r) {
    if (!q._tasks[i]) return; // ignore multiple callbacks
    --q._active, ++q._ended;
    q._tasks[i] = null;
    if (q._error != null) return; // ignore secondary errors
    if (e != null) {
      abort(q, e);
    } else {
      q._data[i] = r;
      if (q._waiting) poke(q);
      else maybeNotify(q);
    }
  };
}

function abort(q, e) {
  var i = q._tasks.length, t;
  q._error = e; // ignore active callbacks
  q._data = undefined; // allow gc
  q._waiting = NaN; // prevent starting

  while (--i >= 0) {
    if (t = q._tasks[i]) {
      q._tasks[i] = null;
      if (t.abort) {
        try { t.abort(); }
        catch (e) { /* ignore */ }
      }
    }
  }

  q._active = NaN; // allow notification
  maybeNotify(q);
}

function maybeNotify(q) {
  if (!q._active && q._call) {
    var d = q._data;
    q._data = undefined; // allow gc
    q._call(q._error, d);
  }
}

function queue(concurrency) {
  return new Queue(arguments.length ? +concurrency : Infinity);
}

exports.queue = queue;

Object.defineProperty(exports, '__esModule', { value: true });

})));
},{}],6:[function(require,module,exports){
function handleError(error) {
  if (error) {
    console.error(error, error.stack);
    var text = '';

    if (error.name) {
      text += error.name + ': ';
    }

    text += error.message;

    if (error.stack) {
      text += ' | ' + error.stack.toString();
    }
    updateStatusMessage(text);
  }
}

function updateStatusMessage(text) {
  var statusMessage = document.getElementById('status-message');
  statusMessage.textContent = text;
  statusMessage.classList.remove('hidden');
}

module.exports = handleError;

},{}],7:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],8:[function(require,module,exports){
'use strict';
module.exports = function (input, maxLength) {
	if (!Array.isArray(input)) {
		throw new TypeError('Expected an array to split');
	}

	if (typeof maxLength !== 'number') {
		throw new TypeError('Expected a number of groups to split the array in');
	}

	var result = [];
	var part = [];

	for (var i = 0; i < input.length; i++) {
		part.push(input[i]);

		// check if we reached the maximum amount of items in a partial
		// or just if we reached the last item
		if (part.length === maxLength || i === input.length - 1) {
			result.push(part);
			part = [];
		}
	}

	return result;
};

},{}],9:[function(require,module,exports){
var splitArray = require('split-array');
var queue = require('d3-queue').queue;
var parseSpotifyUriToObject = require('./parse-spotify-uri-to-object');
var callNextTick = require('call-next-tick');

var apiInfoForTypes = {
  track: {
    endpoint: 'https://api.spotify.com/v1/tracks',
    relevantResultProperty: 'tracks',
    limit: 50
  },
  artist: {
    endpoint: 'https://api.spotify.com/v1/artists',
    relevantResultProperty: 'artists',
    limit: 50
  },
  album: {
    endpoint: 'https://api.spotify.com/v1/albums',
    relevantResultProperty: 'albums',
    limit: 20
  }
};

function SpotifyResolve(createOpts) {
  var request;
  var bearerToken;

  if (createOpts) {
    request = createOpts.request;
    bearerToken = createOpts.bearerToken;
  }

  return spotifyResolve;

  function spotifyResolve(opts, done) {
    var uris;
    var idsByType = {
      track: [],
      artist: [],
      album: []
    };

    if (Array.isArray(opts)) {
      uris = opts;
    }
    else if (opts) {
      uris = [opts];
    }
    else {
      callNextTick(done);
      return;
    }

    uris.forEach(sortIdByType);

    var q = queue();

    for (var type in idsByType) {
      if (idsByType[type].length > 0) {
        q.defer(resolveIds, type, idsByType[type]);
      }
    }

    q.awaitAll(arrangeResultsInOrder);

    function resolveIds(type, ids, done) {
      var apiInfo = apiInfoForTypes[type];
      var idGroups = splitArray(ids, apiInfo.limit);
      var resolveQueue = queue(5);
      idGroups.forEach(queueResolveBatch);
      resolveQueue.awaitAll(done);

      function queueResolveBatch(ids) {
        resolveQueue.defer(resolveBatch, apiInfo, ids);
      }
    }

    function sortIdByType(uri) {
      var uriObject = parseSpotifyUriToObject(uri);
      if (uriObject.type in idsByType) {
        idsByType[uriObject.type].push(uriObject.id);
      }
    }

    function arrangeResultsInOrder(error, resultGroupsForTypes) {
      var objectsByURI = {};

      if (error) {
        done(error);
      }
      else if (!resultGroupsForTypes) {
        done(error, []);
      }
      else {
        resultGroupsForTypes.forEach(storeResultGroups);
        var finalResults = uris.map(getResolvedObjectForURI);

        if (!Array.isArray(opts)) {
          if (finalResults.length > 0) {
            finalResults = finalResults[0];
          }
          else {
            finalResults = undefined;
          }
        }
        done(error, finalResults);
      }

      function storeResultGroups(resultGroups) {
        if (resultGroups) {
          resultGroups.forEach(storeResults);
        }
      }

      function storeResults(results) {
        if (results) {
          results.forEach(storeResult);
        }
      }

      function storeResult(result) {
        if (result && result.uri) {
          objectsByURI[result.uri] = result;
        }
      }

      function getResolvedObjectForURI(uri) {
        return objectsByURI[uri];
      }
    }
  }

  function resolveBatch(apiInfo, ids, done) {
    var reqOpts = {
      method: 'GET',
      url: apiInfo.endpoint + '?ids=' + ids.join(','),
      json: true
    };

    if (bearerToken) {
      reqOpts.headers = {
        Authorization: 'Bearer ' + bearerToken
      };
    }

    request(reqOpts, passResults);

    function passResults(error, response, results) {
      if (error) {
        done(error);
      }
      else {
        done(error, results[apiInfo.relevantResultProperty]);
      }
    }
  }
}

module.exports = SpotifyResolve;

},{"./parse-spotify-uri-to-object":10,"call-next-tick":4,"d3-queue":5,"split-array":8}],10:[function(require,module,exports){
function parseSpotifyUriToObject(uri) {
  var uriObject = {};
  var parts = uri.split(':');
  if (parts.length > 2) {
    parts = parts.slice(1); // Drop initial 'spotify' in URI.
    if (parts.length % 2 === 0) {
      for (var i = 0; i < parts.length; i += 2) {
        uriObject.type = parts[i];
        uriObject.id = parts[i + 1];
      }
    }
    return uriObject;
  }
}

module.exports = parseSpotifyUriToObject;

},{}],11:[function(require,module,exports){
function StandardBail(createOpts) {
  var log;

  if (createOpts) {
    log = createOpts.log;
  }

  function createStandardBailCallback(success, outerCallback) {
    return function standardBailCallback(error) {
      if (error) {
        if (log) {
          if (error.stack) {
            log(error, error.stack);
          }
          else {
            log(error);
          }
        }
        if (outerCallback) {
          outerCallback(error);
        }
      }
      else if (success) {
        var successArgs = Array.prototype.slice.call(arguments, 1);
        if (outerCallback) {
          successArgs .push(outerCallback);
        }
        success.apply(success, successArgs);
      }
    };
  }

  return createStandardBailCallback;
}

module.exports = StandardBail;

},{}]},{},[1]);
