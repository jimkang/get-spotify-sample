/* global Buffer */

var test = require('tape');
var GetSpotifySample = require('../index');
var request = require('request');
var assertNoError = require('assert-no-error');
var getClientCredentials = require('get-spotify-client-credentials');
var config = require('./config');

var testCases = [
  'spotify:track:4q9QVIaLqjbcoqeCfM2zan',
  '3yNVfRQlUPViUh8O2V9SQn'
];

var badTracks = ['spotify:track:badtrackgimLv2eAKyk1NB'];

testCases.forEach(runTest);
badTracks.forEach(runBadTrackTest);

function runTest(trackURI) {
  test('Get track audio', basicTest);

  function basicTest(t) {
    // APIs now require auth.
    getClientCredentials(
      {
        clientId: config.spotify.clientId,
        clientSecret: config.spotify.clientSecret,
        request
      },
      useCreds
    );

    function useCreds(error, token) {
      var getSpotifySample = GetSpotifySample({
        request,
        bearerToken: token
      });
      getSpotifySample(trackURI, checkAudio);
    }

    function checkAudio(error, buffer) {
      assertNoError(t.ok, error, 'No error while getting audio.');
      t.ok(Buffer.isBuffer(buffer), 'A buffer was retrieved.');
      t.ok(buffer.length > 0, 'The buffer is not empty.');
      t.end();
    }
  }
}

function runBadTrackTest(trackURI) {
  test('Get track audio for bad track', basicTest);

  function basicTest(t) {
    // APIs now require auth.
    getClientCredentials(
      {
        clientId: config.spotify.clientId,
        clientSecret: config.spotify.clientSecret,
        request
      },
      useCreds
    );

    function useCreds(error, token) {
      var getSpotifySample = GetSpotifySample({
        request,
        bearerToken: token
      });
      getSpotifySample(trackURI, checkAudio);
    }

    function checkAudio(error) {
      t.ok(error, 'There is an error.');
      t.equal(error.message, 'No sample available for track: ' + trackURI);
      t.end();
    }
  }
}
