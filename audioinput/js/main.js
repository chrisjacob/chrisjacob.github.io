/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

function gotDevices(deviceInfos) {
  var audioInputSelector = document.getElementById('input');

  for (var i = 0; i !== deviceInfos.length; ++i) {
    var deviceInfo = deviceInfos[i];
    var option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === 'audioinput') {
      console.info('Found audio input device: ', deviceInfo.label);
      option.text = deviceInfo.label || 'microphone ' + (audioInputSelector.length + 1);
      audioInputSelector.appendChild(option);
    } else {
      console.log('Found non audio input device: ', deviceInfo.label);
    }
  }
  
  audioInputSelector.addEventListener('change', changeAudioDestination);
  
  if (localStorage.getItem("input-device-id") !== null) {
  	audioInputSelector.value = localStorage.getItem("input-device-id");
  }

}

navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

function changeAudioDestination(event) {
  var deviceId = event.target.value;
  localStorage.setItem("input-device-id", deviceId);
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

