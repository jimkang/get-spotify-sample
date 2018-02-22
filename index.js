var SpotifyResolve = require('spotify-resolve');
var sb = require('standard-bail')();

function GetSpotifySample(opts) {
  var request;
  var bearerToken;
  if (opts) {
    request = opts.request;
    bearerToken = opts.bearerToken;
  }
  var spResolve = SpotifyResolve({request, bearerToken});

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
