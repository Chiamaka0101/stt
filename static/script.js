// ===============================
// GLOBAL STATE
// ===============================
let mediaRecorder;
let audioChunks = [];
let audioBlob = null; // shared audio source (recorded OR uploaded)

const recordBtn = document.getElementById("recordBtn");
const fileInput = document.getElementById("fileInput");
const uploadArea = document.getElementById("uploadArea");

const audioPlayer = document.getElementById("audioPlayer");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stopBtn = document.getElementById("stopBtn");

const transcribeBtn = document.getElementById("transcribeBtn");
const output = document.getElementById("transcriptionText");

// ===============================
// 🎤 RECORD AUDIO
// ===============================
recordBtn.addEventListener("click", async () => {
    try {
        if (!mediaRecorder || mediaRecorder.state === "inactive") {

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.start();
            recordBtn.innerText = "⏹ Stop Recording";

            mediaRecorder.ondataavailable = e => {
                audioChunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                audioBlob = new Blob(audioChunks, { type: "audio/wav" });

                const url = URL.createObjectURL(audioBlob);
                audioPlayer.src = url;
            };

        } else {
            mediaRecorder.stop();
            recordBtn.innerText = "🎙 Start Recording";
        }

    } catch (err) {
        alert("Microphone access denied!");
    }
});

// ===============================
// 📁 CLICK TO UPLOAD
// ===============================
uploadArea.addEventListener("click", () => {
    fileInput.click();
});

// ===============================
// 📁 FILE SELECT
// ===============================
fileInput.addEventListener("change", () => {
    handleUpload(fileInput.files[0]);
});

// ===============================
// 📦 DRAG & DROP
// ===============================
uploadArea.addEventListener("dragover", e => {
    e.preventDefault();
    uploadArea.style.background = "#eee";
});

uploadArea.addEventListener("dragleave", () => {
    uploadArea.style.background = "";
});

uploadArea.addEventListener("drop", e => {
    e.preventDefault();
    uploadArea.style.background = "";

    const file = e.dataTransfer.files[0];
    handleUpload(file);
});

// ===============================
// HANDLE UPLOAD FUNCTION
// ===============================
function handleUpload(file) {
    if (!file) return;

    const validTypes = ["audio/mpeg", "audio/wav", "audio/mp4", "audio/x-m4a"];

    if (!validTypes.includes(file.type)) {
        alert("Invalid file type!");
        return;
    }

    audioBlob = file;

    const url = URL.createObjectURL(file);
    audioPlayer.src = url;
}

// ===============================
// ▶ AUDIO CONTROLS
// ===============================
playBtn.onclick = () => audioPlayer.play();
pauseBtn.onclick = () => audioPlayer.pause();

stopBtn.onclick = () => {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
};

// ===============================
// 🎧 TRANSCRIBE BUTTON
// ===============================
transcribeBtn.addEventListener("click", () => {
    transcribeAudio();
});

// ===============================
// 🧠 TRANSCRIBE FUNCTION
// ===============================
async function transcribeAudio() {

    if (!audioBlob) {
        alert("Please record or upload audio first!");
        return;
    }

    output.value = "⏳ Transcribing...";

    const formData = new FormData();
    formData.append("file", audioBlob, "audio.wav");

    try {
        const res = await fetch("/transcribe", {
            method: "POST",
            body: formData
        });

        if (!res.ok) throw new Error("Server error");

        const data = await res.json();
        output.value = data.text;

    } catch (err) {
        output.value = "❌ Transcription failed. Check server.";
    }
}
