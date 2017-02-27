get-spotify-sample
==================

Gets audio for a sample of a Spotify track as an ArrayBuffer in the browser and a Buffer in Node. [Here's a demo.](http://jimkang.com/get-spotify-sample/demo)

Installation
------------

    npm install get-spotify-sample

Usage
-----

    var GetSpotifySample = require('get-spotify-sample');
    var request = require('request');

    var getSpotifySample = GetSpotifySample({
      request: request
    });
    getSpotifySample('spotify:track:2ye2Wgw4gimLv2eAKyk1NB', playAudio);

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
        sourceNode.connect(audioContext.destination);

        sourceNode.buffer = decodedBuffer;
        sourceNode.loop = true;

        sourceNode.start();
      }
    }

Tests
-----

Run tests with `make test`.

License
-------

The MIT License (MIT)

Copyright (c) 2017 Jim Kang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
