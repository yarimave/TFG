window.AudioContext = (function(){
    return  window.webkitAudioContext || window.AudioContext || window.mozAudioContext;
})();


var azimuth = (Math.PI)/2;
var elevation = 0;

var audioURL = "thecatalyst.wav";
var audioData = null;
var ctx;
// $(document).ready(function() {
//     ctx = $("#canvas").get()[0].getContext("2d");
//     // the AudioContext is the primary 'container' for all your audio node objects
//     try {
//         audioContext = new AudioContext();
//     } catch(e) {
//         alert('Web Audio API is not supported in this browser');
//     }
// });
var audioContext = new AudioContext();

if (audioData == null){
  songBuffer = loadSound(audioURL);
}


//
// songBuffer = loadsound("thecatalyst.wav");
//
// speakersBuffer[1] = loadsound("E35_A45.wav");
// speakersBuffer[2] = loadsound("E35_A-45.wav");
// speakersBuffer[3] = loadsound("E-35_A45.wav");
// speakersBuffer[4] = loadsound("E-35_A-45.wav");
// speakersBuffer[5] = loadsound("E35_A135.wav");
// speakersBuffer[6] = loadsound("E35_A-135.wav");
// speakersBuffer[7] = loadsound("E-35_A135.wav");
// speakersBuffer[8] = loadsound("E-35_A-135.wav");

var a = 0.125;
var b = 0.216495;
var c = 0.21653;

var decoder = [
  [a, a, a, a, a, a, a, a],
  [b, -b, b, -b, b, -b, b, -b],
  [c, c, -c, -c, c, c, -c, -c],
  [-b, -b, -b, -b, b, b, b, b]
];

var W = songBuffer;
var X = songBuffer * Math.cos(azimuth) * Math.cos(elevation);
var Y = songBuffer * Math.sin(azimuth) * Math.cos(elevation);
var Z = songBuffer * Math.sin(elevation);

var Amb = [];

Amb.push(W);
Amb.push(Y);
Amb.push(Z);
Amb.push(X);

Amb[0].map((col, i) => array.map(row => row[i]));

function loadSound(url){
  var request = new XMLHttpRequest();
  request.open('GET',url,true);
  request.responseType = 'arraybuffer';
  request.onload = function(){
    audioContext.decodeAudioData(request.response, function(buffer){
      audioData = buffer;
    });
  }
  request.send();
}
