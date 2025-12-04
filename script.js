// Hugging Face Inference API endpoint for sentiment analysis
const API_URL = "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english";
const API_TOKEN = ""; // Optional: Add your Hugging Face token here for higher rate limits

let chart = null;

// Initialize - allow Enter key to trigger analysis
document.addEventListener('DOMContentLoaded', function() {
    const textInput = document.getElementById('textInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    
    textInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            analyzeSentiment();
        }
    });
    
    textInput.focus();
});

async function analyzeSentiment() {
    const textInput = document.getElementById('textInput');
    const userText = textInput.value.trim();
    
    if (!userText) {
        showError("Please enter a sentence.");
        return;
    }
    
    // Hide previous results and show loading
    hideAll();
    showLoading();
    
    try {
        // Call Hugging Face Inference API
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(API_TOKEN && { 'Authorization': `Bearer ${API_TOKEN}` })
            },
            body: JSON.stringify({ inputs: userText })
        });
        
        if (!response.ok) {
            // If model is loading, wait and retry
            if (response.status === 503) {
                const retryAfter = response.headers.get('Retry-After') || 20;
                showError(`Model is loading. Please wait ${retryAfter} seconds and try again.`);
                return;
            }
            throw new Error(`API error: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Handle array response
        const sentimentData = Array.isArray(result) ? result[0] : result;
        const label = sentimentData.label;
        const score = sentimentData.score;
        
        // Display results
        displayResult(label, score);
        
    } catch (error) {
        console.error('Error:', error);
        showError(`Error analyzing sentiment: ${error.message}. Please try again.`);
    }
}

function displayResult(label, score) {
    hideAll();
    
    const resultContainer = document.getElementById('resultContainer');
    const sentimentResult = document.getElementById('sentimentResult');
    const confidenceScore = document.getElementById('confidenceScore');
    
    // Determine emoji and color based on label
    let emoji, colorClass;
    if (label === "POSITIVE" || label === "LABEL_1") {
        emoji = "😄";
        colorClass = "sentiment-positive";
    } else if (label === "NEGATIVE" || label === "LABEL_0") {
        emoji = "😞";
        colorClass = "sentiment-negative";
    } else {
        emoji = "😐";
        colorClass = "sentiment-neutral";
    }
    
    // Normalize label display
    const displayLabel = label.replace("LABEL_", "").replace("_", " ");
    const normalizedLabel = label.includes("POSITIVE") ? "POSITIVE" : 
                           label.includes("NEGATIVE") ? "NEGATIVE" : "NEUTRAL";
    
    // Display sentiment
    sentimentResult.textContent = `${emoji} ${normalizedLabel}`;
    sentimentResult.className = `sentiment-result ${colorClass}`;
    
    // Display confidence
    confidenceScore.textContent = `Confidence: ${(score * 100).toFixed(2)}%`;
    
    // Create chart
    createChart(normalizedLabel, score);
    
    resultContainer.classList.remove('hidden');
}

function createChart(label, score) {
    const canvas = document.getElementById('chartCanvas');
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (chart) {
        chart.destroy();
    }
    
    // Prepare data
    const sentiments = ["POSITIVE", "NEGATIVE", "NEUTRAL"];
    const confidences = sentiments.map(s => {
        if (s === label) {
            return score;
        } else if (s === "NEUTRAL") {
            return 1 - score;
        } else {
            return 1 - score;
        }
    });
    
    // Normalize to ensure they sum to 1
    const sum = confidences.reduce((a, b) => a + b, 0);
    const normalizedConfidences = confidences.map(c => c / sum);
    
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sentiments,
            datasets: [{
                label: 'Confidence',
                data: normalizedConfidences,
                backgroundColor: [
                    'rgba(0, 200, 83, 0.7)',
                    'rgba(211, 47, 47, 0.7)',
                    'rgba(25, 118, 210, 0.7)'
                ],
                borderColor: [
                    'rgba(0, 200, 83, 1)',
                    'rgba(211, 47, 47, 1)',
                    'rgba(25, 118, 210, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1,
                    ticks: {
                        callback: function(value) {
                            return (value * 100).toFixed(0) + '%';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Confidence: ' + (context.parsed.y * 100).toFixed(2) + '%';
                        }
                    }
                }
            }
        }
    });
}

function hideAll() {
    document.getElementById('resultContainer').classList.add('hidden');
    document.getElementById('infoMessage').classList.add('hidden');
    document.getElementById('loadingSpinner').classList.add('hidden');
    document.getElementById('errorMessage').classList.add('hidden');
}

function showLoading() {
    document.getElementById('loadingSpinner').classList.remove('hidden');
}

function showError(message) {
    hideAll();
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}
