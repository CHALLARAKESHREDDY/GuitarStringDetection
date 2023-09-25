const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const resultDiv = document.getElementById('result');
let audioContext;
let mediaStream;
let analyser;

startButton.addEventListener('click', startRecording);
stopButton.addEventListener('click', stopRecording);

function startRecording() {
    console.log("hello")
    startButton.disabled = true;
    stopButton.disabled = false;
    resultDiv.innerText = 'Listening...';

    audioContext = new(window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();

    navigator.mediaDevices.getUserMedia({
            audio: true
        })
        .then(function(stream) {
            mediaStream = stream;
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            analyser.fftSize = 2048;
            analyser.connect(audioContext.destination);
            analyzeAudio();
        })
        .catch(function(error) {
            console.error('Error accessing microphone:', error);
        });
}

function stopRecording() {
    startButton.disabled = false;
    stopButton.disabled = true;
    resultDiv.innerText = '';

    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        audioContext.close().catch(function(error) {
            console.error('Error closing AudioContext:', error);
        });
    }
}

function analyzeAudio() {
    const dataArray = new Uint8Array(analyser.fftSize);
    analyser.getByteFrequencyData(dataArray);


    const peakIndex = dataArray.indexOf(Math.max(...dataArray));
    const peakFrequency = peakIndex * (audioContext.sampleRate / analyser.fftSize);


    const harmonicThreshold = 30;
    const harmonicFrequencies = [];

    for (let i = 1; i < dataArray.length; i++) {
        if (dataArray[i] >= harmonicThreshold) {
            harmonicFrequencies.push(i * (audioContext.sampleRate / analyser.fftSize));
        }
    }

    harmonicFrequencies.sort((a, b) => dataArray[Math.floor(b / (audioContext.sampleRate / analyser.fftSize))] - dataArray[Math.floor(a / (audioContext.sampleRate / analyser.fftSize))]);
    const detectedFrequency = harmonicFrequencies[0] || peakFrequency;

    const detectedString = mapFrequencyToString(detectedFrequency);
    resultDiv.innerText = `Detected String: ${detectedString}`;

    requestAnimationFrame(analyzeAudio);
}

function mapFrequencyToString(frequency) {

    if (frequency < 82.41) return 'E2';
    if (frequency < 110) return 'A2';
    if (frequency < 146.83) return 'D3';
    if (frequency < 196) return 'G3';
    if (frequency < 246.94) return 'B3';
    if (frequency < 329.63) return "E4";
}