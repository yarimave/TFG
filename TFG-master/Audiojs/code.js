window.AudioContext = (function(){
    return  window.webkitAudioContext || window.AudioContext || window.mozAudioContext;
})();


var azimuth = (Math.PI)/2;
var elevation = 0;

var audioURL = "thecatalyst.wav";
var speakersBuffer = [];
var audioData = null;

var a = 0.125;
var b = 0.216495;
var c = 0.21653;
var decoder = [
  [a, a, a, a, a, a, a, a],
  [b, -b, b, -b, b, -b, b, -b],
  [c, c, -c, -c, c, c, -c, -c],
  [-b, -b, -b, -b, b, b, b, b]
];

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

var convolver = audioContext.createConvolver();
var songBuffer = audioContext.createBuffer(1, 10*audioContext.sampleRate, audioContext.sampleRate);
var speakersBuffer = audioContext.createBuffer(8, 2*audioContext.sampleRate, audioContext.sampleRate);

var saveInThisBuffer = function(buffer){
  audioData = buffer;
}

loadSound(audioURL, songBuffer);

loadSound("E35_A45.wav", speakersBuffer[0]);
loadSound("E35_A-45.wav", speakersBuffer[1]);
loadSound("E-35_A45.wav", speakersBuffer[2]);
loadSound("E-35_A-45.wav", speakersBuffer[3]);
loadSound("E35_A135.wav", speakersBuffer[4]);
loadSound("E35_A-135.wav", speakersBuffer[5]);
loadSound("E-35_A135.wav", speakersBuffer[6]);
loadSound("E-35_A-135.wav", speakersBuffer[7]);


clickme = document.getElementById('clickme');
clickme.addEventListener('click',clickHandler);
function clickHandler(e) {
    playSound(songBuffer);
}


arraySong = songBuffer.getChannelData(0);
//speaker1 = speakersBuffer.getChannelData(1);

var W = arraySong;
//var X = arraySong * Math.cos(azimuth) * Math.cos(elevation);
//var Y = arraySong * Math.sin(azimuth) * Math.cos(elevation);
//var Z = arraySong * Math.sin(elevation);
var X = multiplyTwo(arraySong, Math.cos(azimuth), Math.cos(elevation));
var Y = multiplyTwo(arraySong, Math.sin(azimuth), Math.cos(elevation));
var Z = multiplyOne (arraySong, Math.sin(elevation));


var Amb = [];

Amb.push(W);
Amb.push(Y);
Amb.push(Z);
Amb.push(X);

Amb_tr = transpose(Amb);

matrix = Amb_tr * decoder;
matrix_tr = transpose(matrix);

var dimMatrix = dim(matrix);
for (var i = 0; i < dimMatrix[0]; i++){
  convolver.buffer = speakersBuffer[i];
  matrix[i].connect(convolver);
  convolver.connect(context.destination);
  convolver.clear();
}



function loadSound(url, saveInThisBuffer){
  var request = new XMLHttpRequest();
  request.open('GET',url,true);
  request.responseType = 'arraybuffer';
  request.onload = function(){
    audioContext.decodeAudioData(request.response, saveInThisBuffer);
    }
  request.send();
}

function playSound(buffer){
  var source = audioContext.createBufferSource();
  source.buffer = buffer;

  source.connect(audioContext.destination);
  source.start(0);
}
  

function transpose(matrix){
  var new_matrix = [];
  for (var i=0; i<matrix.length; i++){
    for (var j=0; j<matrix[i].length; j++){
      new_matrix[j][i] = matrix[i][j];
    }
  }
  return new_matrix;
}

function dim(matrix){
  var dimention = [];
  dimention[0] = [matrix.length];
  dimention[1] = matrix[0].length;
  return dimention;
}

function multiplyOne(vector, scalar){
  var new_vector = vector.map(function(element){
    return element*scalar;
  });
  return new_vector;
}

function multiplyTwo(vector, scalar1, scalar2){
  var new_vector = vector.map(function(element){
    return element*scalar1*scalar2;
  });
  return new_vector;
}