window.AudioContext = (function(){
    return  window.webkitAudioContext || window.AudioContext || window.mozAudioContext;
})();


var azimuth = (Math.PI)/2;
var elevation = 0;

var audioURL = "thecatalyst.wav";
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
var sampleRate = audioContext.sampleRate;


//var songBuffer = audioContext.createBuffer(1, 10*audioContext.sampleRate, audioContext.sampleRate);
var hrtfL = audioContext.createBuffer(8, 256, audioContext.sampleRate);
var hrtfR = audioContext.createBuffer(8, 256, audioContext.sampleRate);

var songBuffer = function(buffer){
  audioData = buffer;
}

var counter = 0;
var saveHRTF = function(buffer){
  speaker = buffer;
  hrtfL.copyToChannel(speaker.getChannelData(0), counter);
  hrtfR.copyToChannel(speaker.getChannelData(1), counter);
  speaker = [];
  counter++;
}

loadSound(audioURL, songBuffer);

loadSound("E35_A135.wav", saveHRTF);
loadSound("E35_A-135.wav", saveHRTF);
loadSound("E-35_A135.wav", saveHRTF);
loadSound("E-35_A-135.wav", saveHRTF);
loadSound("E35_A45.wav", saveHRTF);
loadSound("E35_A-45.wav", saveHRTF);
loadSound("E-35_A45.wav", saveHRTF);
loadSound("E-35_A-45.wav", saveHRTF);


setTimeout(function(){

  var arraySong = audioData.getChannelData(0);
  Ambisonics = new Array(4);
  Ambisonics = encode(arraySong, azimuth, elevation, "sn3d");
  Ambisonics = transpose(Ambisonics);
  decodedBeforeTr = multiplyMatrix(Ambisonics, decoder);
  decoded = transpose(decodedBeforeTr);
  
  var convolverLarray = [];
  var convolverRarray = [];
  var pannerArray = [];

  var pannerL = audioContext.createStereoPanner(); var pannerR = audioContext.createStereoPanner();
  pannerL.pan.setValueAtTime(-1, audioContext.currentTime); pannerR.pan.setValueAtTime(1, audioContext.currentTime);
  pannerArray[0] = pannerL;
  pannerArray[1] = pannerR;
  

  for (var c=0; c<8; c++){
    var hrtfLbuffer = audioContext.createBuffer(1, hrtfL.length, sampleRate); var hrtfRbuffer = audioContext.createBuffer(1, hrtfR.length, sampleRate);
    hrtfLbuffer.copyToChannel(hrtfL.getChannelData(c),0);
    hrtfRbuffer.copyToChannel(hrtfR.getChannelData(c),0);

    var convolverL = audioContext.createConvolver(); var convolverR = audioContext.createConvolver();
    convolverL.buffer = hrtfLbuffer; convolverR.buffer = hrtfRbuffer;
    convolverLarray.push(convolverL);
    convolverRarray.push(convolverR);
  }
  

  document.getElementById('playbutton').addEventListener('click', function() {
    var songSource = audioContext.createBufferSource();
    songSource.buffer = audioData;
  
    songSource.connect(pannerL);
    songSource.connect(pannerR);
    for (var co =0; co<8; co++){
      pannerL.connect(convolverLarray[co]);
      pannerR.connect(convolverRarray[co]);
    }

    for (var fi=0;fi<8;fi++){
      convolverLarray[fi].connect(audioContext.destination);
      convolverRarray[fi].connect(audioContext.destination);      
    }


    //songSource.connect(audioContext.destination);
    //convolverL.connect(audioContext.destination);
    //pannerL.connect(audioContext.destination);
    //songSource.connect(audioContext.destination);
    songSource.start(0);
    });

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

//document.getElementById('playbutton').addEventListener('click', function() {
  //source = audioContext.createBufferSource();
  //source.buffer = audioData;
  //source.connect(audioContext.destination);
  //source.start(0);
  //source.isPlaying = true;
  //document.getElementById('playbutton').disabled = true;
  //document.getElementById('stopbutton').disabled = false;
  //});
//document.getElementById('stopbutton').addEventListener('click', function() {
  //source.stop(0);
  //source.isPlaying = false;
  //document.getElementById('playbutton').disabled = false;
  //document.getElementById('stopbutton').disabled = true;
//});

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
  var rows = matrix.length, cols = matrix[0].length;
  var new_matrix = new Array(cols);
  for (var i=0; i<cols; i++){
    new_matrix[i] = new Array(rows);
    for (var j=0; j<rows; j++){
      new_matrix[i][j] = matrix[j][i];
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

function multiplyMatrix(matrix1, matrix2){
  var rows1 = matrix1.length, cols1 = matrix1[0].length,
      rows2 = matrix2.length, cols2 = matrix2[0].length;
  var result = new Array(rows1);
  for(var k = 0; k<rows1; k++){
    result[k] = new Array(cols2);
    for(var j=0; j<cols2; j++){
      result[k][j] = 0;
      for(var i = 0; i<cols1; i++){
        result[k][j] += matrix1[k][i] * matrix2[i][j];
      }
    }
  }
  return result;
}