// Function to send the user's message and get a response from the API
async function sendMessage() {
    const userInput = document.getElementById('userInput').value;
    if (!userInput) return; // Ensure there's input before sending a request

    const response = await getResponseFromAPI(userInput);  // Fetching response from API
    const conversation = document.getElementById('conversation');

    // Display user's input and API's response in conversation area
    conversation.innerHTML += `<div><b>You:</b> ${userInput}</div>`;
    conversation.innerHTML += `<div><b>NiyamaShakthi:</b> ${response}</div>`;
    document.getElementById('userInput').value = '';  // Clear input field

    speakResponse(response);  // Convert the response to speech
}

// Function to get a response from the Hugging Face API using Mistral-Nemo-Instruct-2407
async function getResponseFromAPI(input) {
    const apiKey = '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';  // Replace with your Hugging Face API key
    const url = "https://api-inference.huggingface.co/models/mistralai/Mistral-Nemo-Instruct-2407";  // Model URL

    const payload = {
        inputs: input,
        parameters: {
            max_length: 150,  // Control the maximum length of the response
            temperature: 0.7, // Adjust temperature for creativity
            top_p: 0.9,       // Top-p sampling
            top_k: 50         // Top-k sampling
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,  // API key authorization
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();  // Get the response body for error details
            console.error(`HTTP error! status: ${response.status}, response: ${errorText}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data); // Log the full response
        return data[0]?.generated_text || "Sorry, I don't have an answer for that.";
    } catch (error) {
        console.error('Error fetching response from Hugging Face API:', error);
        return "Sorry, there was an error getting a response.";
    }
}

// Function to start voice recognition
function startVoice() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.onresult = function(event) {
        const speechResult = event.results[0][0].transcript;
        document.getElementById('userInput').value = speechResult;
        sendMessage();
    };
    recognition.start();
}

// Function to convert the response to speech
function speakResponse(response) {
    const utterance = new SpeechSynthesisUtterance(response);
    const voices = speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => voice.name.includes('Google UK English Female') || voice.name.includes('Google US English Female') || voice.name.includes('Microsoft Zira') || voice.name.includes('Samantha'));

    utterance.voice = femaleVoice || voices[0];
    utterance.pitch = 1;
    utterance.rate = 1;
    speechSynthesis.speak(utterance);
}

// Page load events and animations
document.addEventListener("DOMContentLoaded", function() {
    const overlay = document.querySelector('.loading-overlay');

    setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 500);
    }, 2000);

    // Handle intro and chat visibility
    setTimeout(() => {
        const introSection = document.getElementById('intro');
        introSection.style.transition = 'opacity 1s ease';
        introSection.style.opacity = '0';

        setTimeout(() => {
            introSection.style.display = 'none';
            document.getElementById('chat-container').style.display = 'block';
        }, 1000);
    }, 3000); // Show intro for 3 seconds
});
