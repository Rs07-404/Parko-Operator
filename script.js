const startScanButton = document.getElementById('start-scan');
const resultBox = document.getElementById('result-box');
const resultMessage = document.getElementById('result-message');
const closeButton = document.getElementById('close-btn');
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

// Start scanning button click event
startScanButton.addEventListener('click', () => {
    qrCodeScanner = new Html5Qrcode("reader");
    qrCodeScanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
            // Stop the scanner after detecting the QR code
            qrCodeScanner.stop().then(() => {
                // Send the decoded text to API
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
            });
        },
        (error) => {
            console.log(`Error scanning: ${error}`);
        }
    );
});