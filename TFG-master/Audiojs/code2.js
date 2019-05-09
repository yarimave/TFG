window.AudioContext = (function(){
    return  window.webkitAudioContext || window.AudioContext || window.mozAudioContext;
})();


audioContext = new AudioContext();

//audioContext.onstatechange = function() {
    if (audioContext.state !== "runnning") { audioContext.resume(); }
//}

var azimuth = (Math.PI)/2;
var elevation = 0;

var audioURL = "thecatalyst.wav";
var speakersBuffer = [];
var audioData;

var a = 0.125;
var b = 0.216495;
var c = 0.21653;
var decoder = [
  [a, a, a, a, a, a, a, a],
  [b, -b, b, -b, b, -b, b, -b],
  [c, c, -c, -c, c, c, -c, -c],
  [-b, -b, -b, -b, b, b, b, b]
];



var convolver = audioContext.createConvolver();
var songBuffer = audioContext.createBuffer(1, 10*audioContext.sampleRate, audioContext.sampleRate);
//var songBuffer = audioContext.createBufferSource;
var speakersBuffer = audioContext.createBuffer(8, 2*audioContext.sampleRate, audioContext.sampleRate);

var saveInThisBuffer = function(buffer){
  audioData = buffer;
}

loadSound(audioURL, saveInThisBuffer);

//songBuffer.buffer = audioData;

//loadSound("E35_A45.wav", speakersBuffer[0]);
//loadSound("E35_A-45.wav", speakersBuffer[1]);
//loadSound("E-35_A45.wav", speakersBuffer[2]);
//loadSound("E-35_A-45.wav", speakersBuffer[3]);
//loadSound("E35_A135.wav", speakersBuffer[4]);
//loadSound("E35_A-135.wav", speakersBuffer[5]);
//loadSound("E-35_A135.wav", speakersBuffer[6]);
//loadSound("E-35_A-135.wav", speakersBuffer[7]);


clickme = document.getElementById('clickme');
clickme.addEventListener('click',clickHandler);
function clickHandler(e) {
    playSound(songBuffer);
}

//ARRAY OF 23
var arraySong = songBuffer.getChannelData(0);
for (var i = 0; i < arraySong.length; i++) {
    // Math.random() is in [0; 1.0]
    // audio needs to be in [-1.0; 1.0]
    arraySong[i] = 23;
}




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


matrix = multiplyMatrixNoTranspose(Amb,decoder);
var new_matrix = transpose(matrix);

//matrix --- SAVE INTO BUFFER
var decoderBuffer = audioContext.createBuffer(new_matrix.length, 11*audioContext.sampleRate, audioContext.sampleRate);
for(var i = 0; i < new_matrix.length; i++){
  var casted = new Float32Array(new_matrix[i]);
  decoderBuffer.copyToChannel(casted, 1, i);
}

//CONVOLVE
var impulse;
var impulses = new Array(number_HRTF);
for (var i = 0; i < number_HRTF; i++){
  impulse = base64ToArrayBuffer(speakersBuffer[i]);
  audioContext.decodeAudioData(impulse, function(buffer){
    //convolved es un buffer que tendra todas las convoluciones
    convolved.buffer = buffer;
  })
 
}



function loadSound(url, whatToDo){
  var request = new XMLHttpRequest();
  request.open('GET',url,true);
  request.responseType = 'arraybuffer';
  request.onload = function(){
    audioContext.decodeAudioData(request.response, whatToDo);
    }
  request.send();
}


function playSound(buffer){
  var source = audioContext.createBufferSource();
  source.buffer = buffer;

  source.connect(audioContext.destination);
  source.start(0);
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

function transpose(matrix){
  var rows = matrix.length, cols = matrix[0].length;
  var new_matrix = new Array(cols);
  for (var j = 0; j<cols; j++){
    new_matrix[j] = new Array(rows);
    for (var i = 0; i<rows; i++){
      new_matrix[j][i] = matrix[i][j];
    }
  }
  return new_matrix;
}

function multiply(a, b) {
  var aNumRows = a.length, aNumCols = a[0].length,
      bNumRows = b.length, bNumCols = b[0].length,
      m = new Array(aNumRows);  // initialize array of rows
  for (var r = 0; r < aNumRows; ++r) {
    m[r] = new Array(bNumCols); // initialize the current row
    for (var c = 0; c < bNumCols; ++c) {
      m[r][c] = 0;             // initialize the current cell
      for (var i = 0; i < aNumCols; ++i) {
        m[r][c] += a[r][i] * b[i][c];
      }
    }
  }
  return m;
}