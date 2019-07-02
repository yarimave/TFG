window.AudioContext = (function(){
    return  window.webkitAudioContext || window.AudioContext || window.mozAudioContext;
})();

var audioContext = new AudioContext();
var sampleRate = audioContext.sampleRate;

//audioContext.destination.channelCount = 1;
// https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html#UpMix
var audioData;
var speakersBuffer= [];
var speaker;
var rir;
var source;
var gainVolume = audioContext.createGain();


var azimuth = 0;
var elevation = 0;

var mode = "a";

var saveSong = function(buffer){
  audioData = buffer;
}

var hrtfL = audioContext.createBuffer(8, 256, audioContext.sampleRate);
var hrtfR = audioContext.createBuffer(8, 256, audioContext.sampleRate);
var counter = 0;
var saveHRTF = function(buffer){
  speaker = buffer;
  hrtfL.copyToChannel(speaker.getChannelData(0), counter);
  hrtfR.copyToChannel(speaker.getChannelData(1), counter);
  counter++;
  speaker = [];
}

var saveRIR = function(buffer){
  rir = buffer;
}

if (sampleRate == 44100) var audioURL = "/44folder/";
else if (sampleRate == 48000) var audioURL = "/48folder/";

loadSound(audioURL.concat("thecatalyst.wav"), saveSong);
loadSound(audioURL.concat("sadie/E35_A135.wav"), saveHRTF);
setTimeout(function(){
loadSound(audioURL.concat("sadie/E35_A-135.wav"), saveHRTF);
},100);
setTimeout(function(){
loadSound(audioURL.concat("sadie/E-35_A135.wav"), saveHRTF);
},200);
setTimeout(function(){
loadSound(audioURL.concat("sadie/E-35_A-135.wav"), saveHRTF);
},300);
setTimeout(function(){
loadSound(audioURL.concat("sadie/E35_A45.wav"), saveHRTF);
},400);
setTimeout(function(){
loadSound(audioURL.concat("sadie/E35_A-45.wav"), saveHRTF);
},500);
setTimeout(function(){
loadSound(audioURL.concat("sadie/E-35_A45.wav"), saveHRTF);
},600);
setTimeout(function(){
loadSound(audioURL.concat("sadie/E-35_A-45.wav"), saveHRTF);
},700);

loadSound(audioURL.concat("mainchurch/ls1.wav"), saveRIR);


setTimeout(function(){
  var arraySong = audioData.getChannelData(0);
  
  var decodedbuffer = audioContext.createBuffer(8, arraySong.length, sampleRate);
  decodedbuffer = returnDec(arraySong, azimuth,elevation);

  var convolverLarray = [];
  var convolverRarray = [];
  var pannerLarray = [];
  var pannerRarray = [];

  var convolverRIR = audioContext.createConvolver();
  convolverRIR.normalize = false;
  convolverRIR.channelInterpretation = 'discrete';
  convolverRIR.buffer = rir;
    
  //Filling convolver buffers
  for (var c=0; c<8; c++){
    var hrtfLbuffer = audioContext.createBuffer(1, hrtfL.length, sampleRate); var hrtfRbuffer = audioContext.createBuffer(1, hrtfR.length, sampleRate);
    hrtfLbuffer.copyToChannel(hrtfL.getChannelData(c),0);
    hrtfRbuffer.copyToChannel(hrtfR.getChannelData(c),0);

    var convolverL = audioContext.createConvolver(); var convolverR = audioContext.createConvolver();
    convolverL.normalize = false; convolverR.normalize = false;
    convolverL.channelInterpretation = 'discrete'; convolverR.channelInterpretation = 'discrete';
    convolverL.buffer = hrtfLbuffer; convolverR.buffer = hrtfRbuffer;
    convolverLarray.push(convolverL);
    convolverRarray.push(convolverR);

    var pannerL = audioContext.createStereoPanner(); var pannerR = audioContext.createStereoPanner();
    pannerL.channelInterpretation = 'discrete'; pannerR.channelInterpretation = 'discrete';
    pannerL.pan.setValueAtTime(-1, audioContext.currentTime); pannerR.pan.setValueAtTime(1, audioContext.currentTime);

    pannerLarray.push(pannerL);
    pannerRarray.push(pannerR);

    var decArrayA = [];
    var decArrayB = [];
    var decArrayC = [];
    var decArrayD = [];
    var decNorm = [];
    var sumArray = [];

    //Creating nodes decoder & normalization & summing
    var counter = 0;
    for (var ndec = 0; ndec<8; ndec++){
      var gainA = audioContext.createGain();
      gainA.channelInterpretation = 'discrete';
      gainA.gain.value = 0.125;
      decArrayA.push(gainA);
      if (ndec%2 == 0){
        var gainB = audioContext.createGain();
        gainB.gain.value = 0.216495;
        gainB.channelInterpretation = 'discrete';
      } else{
        var gainB = audioContext.createGain();
        gainB.channelInterpretation = 'discrete';
        gainB.gain.value = -0.216495;
      }
      decArrayB.push(gainB);
      if (ndec>3){
        var gainD = audioContext.createGain();
        gainD.channelInterpretation = 'discrete';
        gainD.gain.value = 0.216495;
      } else{
        var gainD = audioContext.createGain();
        gainD.channelInterpretation = 'discrete';
        gainD.gain.value = -0.216495;
      }
      decArrayD.push(gainD);
      if (counter==2 || counter==3){
        var gainC = audioContext.createGain();
        gainC.channelInterpretation = 'discrete';
        gainC.gain.value = -0.21653;
      } else{
        var gainC = audioContext.createGain();
        gainC.channelInterpretation = 'discrete';
        gainC.gain.value = 0.21653;
      }
      decArrayC.push(gainC);
      counter++;
      if (counter>3){
        counter = 0;
      }
      var norm = audioContext.createGain();
      norm.channelInterpretation = 'discrete';
      norm.gain.value = 0.7071067;
      decNorm.push(norm);

      var summ = audioContext.createChannelMerger(4);
      summ.channelInterpretation = 'discrete';
      sumArray.push(summ);
    }
    
  }

  //Creating mergers
  var mergerL = audioContext.createChannelMerger(8);
  var mergerR = audioContext.createChannelMerger(8);

  mergerL.channelInterpretation = 'discrete'; mergerR.channelInterpretation = 'discrete';

  //Creating splitters
  var splitter = audioContext.createChannelSplitter(8);
  splitter.channelInterpretation = 'discrete';
  
  var splitterRIR = audioContext.createChannelSplitter(4);
  splitterRIR.channelInterpretation = 'discrete';

  //Creating gainVolumes
  var gainVolume = audioContext.createGain();
  gainVolume.channelInterpretation = 'discrete';

  //EVENT LISTENERS
  //CHANGE audio file
  document.getElementById('sample_no').addEventListener('change', function(){
  var x = document.getElementById('sample_no');
  loadSound(x.value.toString(),saveSong);
  setTimeout(function(){
    arraySong = audioData.getChannelData(0);
    decodedbuffer = returnDec(arraySong, azimuth, elevation);
  },700);  
  })

  //CHANGE azimuth anechoic
  document.getElementById('a_anechoic').addEventListener('change', function(){
    var a = (document.getElementById('a_anechoic'));
    azimuth = parseFloat(a.value);
    decodedbuffer = returnDec(arraySong, azimuth, elevation);
  })
  //CHANGE elevation anechoic
  document.getElementById('e_anechoic').addEventListener('change', function(){
    var e = (document.getElementById('e_anechoic'));
    elevation = parseFloat(e.value);    
    decodedbuffer = returnDec(arraySong, azimuth, elevation);
  })

  //CHANGE mode
  document.getElementById('anechoic').disabled = true;
  document.getElementById('room_main').disabled = true;
  document.getElementById('room_old').disabled = true;
  document.getElementById('room_adbooth').disabled = true;
  document.getElementById('room_vis').disabled = true;  
  document.getElementById('anechoic').addEventListener('click',function(){
    mode = "a";
    document.getElementById('anechoic').disabled = true;
    document.getElementById('reverberant').disabled = false;
    document.getElementById('room_main').disabled = true;
    document.getElementById('room_old').disabled = true;
    document.getElementById('room_adbooth').disabled = true;
    document.getElementById('room_vis').disabled = true;
    document.getElementById('a_anechoic').disabled = false;
    document.getElementById('e_anechoic').disabled = false;
  })

  document.getElementById('reverberant').addEventListener('click',function(){
    mode = "r";
    document.getElementById('anechoic').disabled = false;
    document.getElementById('reverberant').disabled = true;
    document.getElementById('room_main').disabled = false;
    document.getElementById('room_old').disabled = false;
    document.getElementById('room_adbooth').disabled = false;
    document.getElementById('room_vis').disabled = false;
    document.getElementById('a_anechoic').disabled = true;
    document.getElementById('e_anechoic').disabled = true;
  })

  //CHANGE reverb
  document.getElementById('room_main').addEventListener('change',function(){
    var len = convolverRIR.buffer.length;
    var a1 = new Float32Array(len).fill(0);

    var resetBuffer = audioContext.createBuffer(4, len, sampleRate);
    for (var chres = 0; chres<4; chres++){
      resetBuffer.copyToChannel(a1, chres);
    }
    convolverRIR.buffer = resetBuffer;
    var roo = (document.getElementById('room_main'));
    var newstr = roo.value.toString();
    loadSound(audioURL.concat(newstr), saveRIR);
    setTimeout(function(){
      convolverRIR.buffer = rir;
    },200);
  })
   document.getElementById('room_old').addEventListener('change',function(){
    var len = convolverRIR.buffer.length;
    var a1 = new Float32Array(len).fill(0);

    var resetBuffer = audioContext.createBuffer(4, len, sampleRate);
    for (var chres = 0; chres<4; chres++){
      resetBuffer.copyToChannel(a1, chres);
    }
    convolverRIR.buffer = resetBuffer;
    var roo = (document.getElementById('room_old'));
    var newstr = roo.value.toString();
    loadSound(audioURL.concat(newstr), saveRIR);
    setTimeout(function(){
      convolverRIR.buffer = rir;
    },200);
  })
  document.getElementById('room_adbooth').addEventListener('change',function(){
   var len = convolverRIR.buffer.length;
    var a1 = new Float32Array(len).fill(0);

    var resetBuffer = audioContext.createBuffer(4, len, sampleRate);
    for (var chres = 0; chres<4; chres++){
      resetBuffer.copyToChannel(a1, chres);
    }
    convolverRIR.buffer = resetBuffer;
    var roo = (document.getElementById('room_adbooth'));
    var newstr = roo.value.toString();
    loadSound(audioURL.concat(newstr), saveRIR);
    setTimeout(function(){
      convolverRIR.buffer = rir;
    },200);
  })
  document.getElementById('room_vis').addEventListener('change',function(){
    var len = convolverRIR.buffer.length;
    var a1 = new Float32Array(len).fill(0);

    var resetBuffer = audioContext.createBuffer(4, len, sampleRate);
    for (var chres = 0; chres<4; chres++){
      resetBuffer.copyToChannel(a1, chres);
    }
    convolverRIR.buffer = resetBuffer;
    var roo = (document.getElementById('room_vis'));
    var newstr = roo.value.toString();
    loadSound(audioURL.concat(newstr), saveRIR);
    setTimeout(function(){
      convolverRIR.buffer = rir;
    },200);
  })
  //PLAY button
  document.getElementById('stopbutton').disabled = true;
  document.getElementById('playbutton').addEventListener('click', function() {
     
    var songSource = audioContext.createBufferSource();
    if(mode == "r"){
      
      songSource.buffer = audioData;
      songSource.channelInterpretation = 'discrete';
      var dur = (songSource.buffer.duration)*1000;

      songSource.connect(convolverRIR);
      convolverRIR.connect(splitterRIR);

      for (var gains = 0; gains<8; gains++){
        splitterRIR.connect(decNorm[gains],0);
        decNorm[gains].connect(decArrayA[gains]);
        splitterRIR.connect(decArrayB[gains],2);
        splitterRIR.connect(decArrayC[gains],3);
        splitterRIR.connect(decArrayD[gains],1);
      }

      for (var su = 0; su<8; su++){
        decArrayA[su].connect(sumArray[su]);
        decArrayB[su].connect(sumArray[su]);
        decArrayC[su].connect(sumArray[su]);
        decArrayD[su].connect(sumArray[su]);
      }

      for(conv = 0; conv<8; conv++){
        sumArray[conv].connect(convolverLarray[conv]);
        sumArray[conv].connect(convolverRarray[conv]);
      }
    } else if (mode == "a"){
      //From AudioBuffer to AudioBufferSource
      songSource.buffer = decodedbuffer;
      songSource.channelInterpretation = 'discrete';
  
      var dur = (songSource.buffer.duration)*1000;
  
      songSource.connect(splitter);
      
      for(con = 0; con<8; con++){
        splitter.connect(convolverLarray[con],con);
        splitter.connect(convolverRarray[con],con);
      }
    }

    //Each convolver connected to its merger
    for (var merg = 0; merg<8; merg++){
      convolverLarray[merg].connect(mergerL);
      convolverRarray[merg].connect(mergerR);
    }
    
    mergerL.connect(pannerL);
    mergerR.connect(pannerR);
    
    pannerL.connect(gainVolume);
    pannerR.connect(gainVolume);

    gainVolume.connect(audioContext.destination);
    //Ensuring all connections are prepared
    setTimeout(function(){
      songSource.start();
    },500);
      
      
    //Disabling some buttons for no multiplaying
    document.getElementById('playbutton').disabled = true;
    document.getElementById('stopbutton').disabled = false;
    setTimeout(function(){
      document.getElementById('playbutton').disabled = false;
      document.getElementById('stopbutton').disabled = true;
    },dur);
   
    //STOP button
    document.getElementById('stopbutton').addEventListener('click', function() {
      songSource.stop(0);
      songSource.isPlaying = false;
      document.getElementById('playbutton').disabled = false;
      document.getElementById('stopbutton').disabled = true;
    });
    //VOLUME
    document.getElementById('volume-slider').addEventListener('click', function(){
      var v = document.getElementById('volume-slider');
      gainVolume.gain.setValueAtTime(v.value, audioContext.currentTime);
    });
 });  
},700);


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

function fill32Matrix(matrix){
  var rows = matrix.length;
  var cols = matrix[0].length;
  var result = new Array(rows);
  for (var q = 0; q<rows; q++){
    var onerow = new Float32Array(matrix[q]);    
    result[q] = onerow;
  }

  return result;
}

function returnDec (audio, azimuth, elevation){
  var a = 0.125;
  var b = 0.216495;
  var c = 0.21653;
  var decoder = [
    [a, a, a, a, a, a, a, a],
    [b, -b, b, -b, b, -b, b, -b],
    [c, c, -c, -c, c, c, -c, -c],
    [-b, -b, -b, -b, b, b, b, b]
  ];
  //Encoding
  Ambisonics = new Float32Array(4);
  Ambisonics = encode(audio, azimuth, elevation, "sn3d");
  Ambisonics = transpose(Ambisonics);
  decodedBeforeTr = multiplyMatrix(Ambisonics, decoder);
  //Result decoder
  decodedBeforeFormat = transpose(decodedBeforeTr);
  
  //Array to Float32Array (AudioBuffer must be in Float32Array)
  var decoded = fill32Matrix(decodedBeforeFormat);
  var decobuffer = audioContext.createBuffer(8, decoded[0].length, sampleRate);
  //Fill AudioBuffer
  for (var fill = 0; fill<8; fill++){
    decobuffer.copyToChannel(decoded[fill],fill);
  }
  return decobuffer;
}