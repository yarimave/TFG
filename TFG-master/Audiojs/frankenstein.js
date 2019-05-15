window.AudioContext = (function(){
    return  window.webkitAudioContext || window.AudioContext || window.mozAudioContext;
})();

var audioContext = new AudioContext();
var sampleRate = audioContext.sampleRate;

var audioData;
var speakersBuffer= [];
var speaker;
var source;
var gainVolume = audioContext.createGain();

var azimuth = (Math.PI)/2;
var elevation = 0;

var a = 0.125;
var b = 0.216495;
var c = 0.21653;
var decoder = [
  [a, a, a, a, a, a, a, a],
  [b, -b, b, -b, b, -b, b, -b],
  [c, c, -c, -c, c, c, -c, -c],
  [-b, -b, -b, -b, b, b, b, b]
];

var saveSong = function(buffer){
  audioData = buffer;
}

var saveHRTF = function(buffer){
  speaker = buffer;
  speakersBuffer.push(speaker);
  speaker = [];
}

if (sampleRate == 44100) var audioURL = "44folder/";
//ARREGLAR ESTOOOOOOOOOO!!!!!
					else if (sampleRate == 48000) var audioURL = "44folder/"

loadSound(audioURL.concat("thecatalyst.wav"), saveSong);
loadSound("E35_A135.wav", saveHRTF);
loadSound("E35_A-135.wav", saveHRTF);
loadSound("E-35_A135.wav", saveHRTF);
loadSound("E-35_A-135.wav", saveHRTF);
loadSound("E35_A45.wav", saveHRTF);
loadSound("E35_A-45.wav", saveHRTF);
loadSound("E-35_A45.wav", saveHRTF);
loadSound("E-35_A-45.wav", saveHRTF);

setTimeout(function(){
  arraySong = audioData.getChannelData(0);
  
  Ambisonics = new Array(4);
  Ambisonics = encode(arraySong, azimuth, elevation, "sn3d");

},500);

document.getElementById('sample_no').addEventListener('change', function(){
  var x = document.getElementById('sample_no');
  loadSound(x.value.toString(),saveSong);
})

document.getElementById('stopbutton').disabled = true;

document.getElementById('playbutton').addEventListener('click', function() {
  source = audioContext.createBufferSource();
  source.buffer = audioData;
  var dur = (source.buffer.duration)*1000;
  source.connect(audioContext.destination);
  source.start(0);  
  document.getElementById('playbutton').disabled = true;
  document.getElementById('stopbutton').disabled = false;
  setTimeout(function(){
    document.getElementById('playbutton').disabled = false;
    document.getElementById('stopbutton').disabled = true;
  },dur);
  });
document.getElementById('stopbutton').addEventListener('click', function() {
  source.stop(0);
  source.isPlaying = false;
  document.getElementById('playbutton').disabled = false;
  document.getElementById('stopbutton').disabled = true;
});
document.getElementById('volume-slider').addEventListener('click', function(){
  var v = document.getElementById('volume-slider');
  gainVolume.gain.setValueAtTime(v.value, audioContext.currentTime);
  gainVolume.connect(audioContext.destination);
});

function loadSound(url, doAfterLoading){
  var request = new XMLHttpRequest();
  request.open('GET',url,true);
  request.responseType = 'arraybuffer';
  request.onload = function(){
    audioContext.decodeAudioData(request.response, doAfterLoading);
    }
  request.send();
}

function encode(arrayAudio, azimuth, elevation, format){

  var W = arrayAudio;
  var X = multiplyTwo(arrayAudio, Math.cos(azimuth), Math.cos(elevation));
  var Y = multiplyTwo(arrayAudio, Math.sin(azimuth), Math.cos(elevation));
  var Z = multiplyOne(arrayAudio, Math.sin(elevation));

  var Amb = [];

  if (format == "fuma"){
    W = divide(W, Math.sqrt(2));
    Amb.push(W);
    Amb.push(X);
    Amb.push(Y);
    Amb.push(Z);
  }
  else {
    Amb.push(W);
    Amb.push(Y);
    Amb.push(Z);
    Amb.push(X);
  }
  return Amb;
}

function divide(vector, scalar){
  var new_vector = vector.map(function(element){
    return element/scalar;
  });
  return new_vector;
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

function transpose(matrix){
  var new_matrix = [];
  for (var i=0; i<matrix.length; i++){
    for (var j=0; j<matrix[i].length; j++){
      new_matrix[j][i] = matrix[i][j];
    }
  }
  return new_matrix;
}

function multiplyMatrixNoTranspose(matrix1, matrix2){
  var rows1 = matrix1.length, cols1 = matrix1[0].length,
      rows2 = matrix2.length, cols2 = matrix2[0].length;
  var result = new Array(cols1);
  for(var k = 0; k<cols1; k++){
    result[k] = new Array(cols2);
    for(var j=0; j<cols2; j++){
      result[k][j] = 0;
      for(var i = 0; i<rows1; i++){
        result[k][j] += matrix1[i][k] * matrix2[i][j];
      }
    }
  }
  return result;
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