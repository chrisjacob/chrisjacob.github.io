/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

// Attach audio output device to the provided media element using the deviceId.
function attachSinkId(element, sinkId, outputSelector) {
  if (typeof element.sinkId !== 'undefined') {
    element.setSinkId(sinkId)
    .then(function() {
      console.log('Success, audio output device attached: ' + sinkId + ' to ' +
          'element with ' + element.title + ' as source.');
    })
    .catch(function(error) {
      var errorMessage = error;
      if (error.name === 'SecurityError') {
        errorMessage = 'You need to use HTTPS for selecting audio output ' +
            'device: ' + error;
      }
      console.error(errorMessage);
      // Jump back to first output device in the list as it's the default.
      outputSelector.selectedIndex = 0;
    });
  } else {
    console.warn('Browser does not support output device selection.');
  }
}

function gotDevices(deviceInfos) {
  var audioOutputSelector = document.getElementById('output');

  for (var i = 0; i !== deviceInfos.length; ++i) {
    var deviceInfo = deviceInfos[i];
    var option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === 'audiooutput') {
      console.info('Found audio output device: ', deviceInfo.label);
      option.text = deviceInfo.label || 'speaker ' + (audioOutputSelector.length + 1);
      audioOutputSelector.appendChild(option);
    } else {
      console.log('Found non audio output device: ', deviceInfo.label);
    }
  }
  
  audioOutputSelector.addEventListener('change', changeAudioDestination);
  
  if (localStorage.getItem("output-device-id") !== null) {
  	audioOutputSelector.value = localStorage.getItem("output-device-id");
  	var element = document.getElementById('mp3');
  	attachSinkId(element, localStorage.getItem("output-device-id"), audioOutputSelector);
  }
}

navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

function changeAudioDestination(event) {
  var deviceId = event.target.value;
  localStorage.setItem("output-device-id", deviceId);
  var outputSelector = event.target;
  
  var element = document.getElementById('mp3');
  attachSinkId(element, deviceId, outputSelector);
}

function start() {
  var constraints = {
    audio: true,
    video: false
  };
}

start();

function handleError(error) {
  console.log('Error: ', error);
}

