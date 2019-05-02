window.AudioContext = (function(){
    return  window.webkitAudioContext || window.AudioContext || window.mozAudioContext;
})();


var azimuth = (Math.PI)/2;
var elevation = 0;

var audioURL = "thecatalyst48.wav";
var speakersBuffer = [];
var audioData = null;
var speaker;
var source;

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

//var songBuffer = audioContext.createBuffer(1, 10*audioContext.sampleRate, audioContext.sampleRate);
//var speakersBuffer = audioContext.createBuffer(8, 2*audioContext.sampleRate, audioContext.sampleRate);

var songBuffer = function(buffer){
  audioData = buffer;
}

var speakersBuffer = function(buffer){
  speaker = buffer;
}

loadSound(audioURL, songBuffer);

loadSound("E35_A4548.wav", speakersBuffer);

setTimeout(function(){

  arraySong = audioData.getChannelData(0);
  speakerir = speaker.getChannelData(0);

  output = conv(arraySong,speakerir);

  var convolver = audioContext.createConvolver();
  convolver.buffer = speaker;
  var songSource = audioContext.createBufferSource();
  songSource.buffer = audioData;
  
  var output = audioContext.createAnalyser();
  songSource.connect(convolver).connect(output);
},2000);



//loadSound("E35_A-45.wav", speakersBuffer[1]);
//loadSound("E-35_A45.wav", speakersBuffer[2]);
//loadSound("E-35_A-45.wav", speakersBuffer[3]);
//loadSound("E35_A135.wav", speakersBuffer[4]);
//loadSound("E35_A-135.wav", speakersBuffer[5]);
//loadSound("E-35_A135.wav", speakersBuffer[6]);
//
//loadSound("E-35_A-135.wav", speakersBuffer[7]);


document.getElementById('stopbutton').disabled = true;

document.getElementById('playbutton').addEventListener('click', function() {
  source = audioContext.createBufferSource();
  source.buffer = audioData;
  source.connect(audioContext.destination);
  source.start(0);
  source.isPlaying = true;
  document.getElementById('playbutton').disabled = true;
  document.getElementById('stopbutton').disabled = false;
  });
document.getElementById('stopbutton').addEventListener('click', function() {
  source.stop(0);
  source.isPlaying = false;
  document.getElementById('playbutton').disabled = false;
  document.getElementById('stopbutton').disabled = true;
});












arraySong = audioData.getChannelData(0);
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


function loadSound(url, doAfterLoading){
  var request = new XMLHttpRequest();
  request.open('GET',url,true);
  request.responseType = 'arraybuffer';
  request.onload = function(){
    audioContext.decodeAudioData(request.response, doAfterLoading);
    }
  request.send();
}

//function playSound(){
//  source.start(audioContext.currentTime);
//}

//function stopSound(){
//  source.stop(audioContext.currentTime);
//}



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

function conv(vec1, vec2){
    var disp = 0; // displacement given after each vector multiplication by element of another vector
    var convVec = [];
    // for first multiplication
    for (j = 0; j < vec2.length ; j++){
        convVec.push(vec1[0] * vec2[j]);
    }
    disp = disp + 1;
    for (i = 1; i < vec1.length ; i++){
        for (j = 0; j < vec2.length ; j++){
            if ((disp + j) !== convVec.length){
                convVec[disp + j] = convVec[disp + j] + (vec1[i] * vec2[j])
            }
            else{
                convVec.push(vec1[i] * vec2[j]);
            }
        }
        disp = disp + 1;
    }
    return convVec;
}
