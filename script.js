const video = document.getElementById("video");
const shutterButton = document.getElementById("shutter");
const resultBox = document.getElementById("result-box");
const resultMessage = document.getElementById("result-message");
const closeButton = document.getElementById("close-btn");
const apiUrl = "http://localhost:5000/api/reservation/verifyreservation";
let qrCodeScanner;

// Function to display result box
function showResultBox(message, isSuccess) {
    resultBox.style.display = 'block';
    resultBox.className = isSuccess ? 'success' : 'error';
    resultMessage.textContent = message;
}

// Function to close result box
closeButton.addEventListener('click', () => {
    resultBox.style.display = 'none';
});

// Access the user's camera
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        video.srcObject = stream;
    } catch (err) {
        console.error("Error accessing camera:", err);
    }
}

// Initialize QR Code Scanner
async function scanQRCode() {
    try {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        const decodedText = await Html5QrcodeScanner.scanImage(imageData);

        // Stop video stream
        const stream = video.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());

        // Send decoded text to API
        fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ data: decodedText })
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    showResultBox("Successfully Verified", true);
                } else {
                    showResultBox("Not Verified", false);
                }
            })
            .catch(() => {
                showResultBox("Error while verifying", false);
            });
    } catch (error) {
        console.error("QR Code scan failed:", error);
        showResultBox("Failed to scan QR code.", false);
    }
}

// Shutter button click event
shutterButton.addEventListener("click", scanQRCode);

// Start the camera when the page loads
window.addEventListener("load", startCamera);