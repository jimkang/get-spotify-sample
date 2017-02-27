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
    sourceNode.connect(audioContext.destination);

    sourceNode.buffer = decodedBuffer;
    sourceNode.loop = true;

    sourceNode.start();
  }
}
