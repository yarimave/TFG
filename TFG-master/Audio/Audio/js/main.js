//Creating context
const AudioContext = new (window.AudioContext || window.webkitAudioContext)();
const audioContext = new AudioContext();

//Getting the audio element
const audioElement = document.querySelector('audio');

//Pass it into the audio context
const track = audioContext.createMediaElementSource(audioElement);

//Connecting the audio graph from the audio input node to the destination
track.connect(audioContext.destination);


//Adding play and pause functionality
const playButton = document.querySelector('button');
playButton.addEventListener('click', function () {

    // check if context is in suspended state (autoplay policy)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    // play or pause track depending on state
    if (this.dataset.playing === 'false') {
        audioElement.play();
        this.dataset.playing = 'true';
    } else if (this.dataset.playing === 'true') {
        audioElement.pause();
        this.dataset.playing = 'false';
    }

}, false);


//Pause when finishing playing
audioElement.addEventListener('ended', () => {
    playButton.dataset.playing = 'false';
}, false);