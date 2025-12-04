// Hugging Face Inference API endpoint for sentiment analysis
const API_URL = "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english";
const API_TOKEN = ""; // Optional: Add your Hugging Face token here for higher rate limits

// Alternative CORS proxy service
const CORS_PROXY = "https://api.allorigins.win/raw?url=";

let chartCanvas = null;

// Simple client-side sentiment analysis as fallback
function simpleSentimentAnalysis(text) {
    const lowerText = text.toLowerCase();
    
    // Positive words
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like', 'happy', 'joy', 'pleased', 'delighted', 'awesome', 'brilliant', 'perfect', 'best', 'beautiful', 'nice', 'wonderful', 'superb', 'outstanding', 'marvelous', 'fabulous'];
    
    // Negative words
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'sad', 'angry', 'frustrated', 'disappointed', 'worst', 'ugly', 'poor', 'pathetic', 'disgusting', 'annoying', 'furious', 'miserable', 'depressed', 'awful', 'dreadful'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    positiveWords.forEach(word => {
        if (lowerText.includes(word)) positiveCount++;
    });
    
    negativeWords.forEach(word => {
        if (lowerText.includes(word)) negativeCount++;
    });
    
    if (positiveCount > negativeCount) {
        return { label: 'POSITIVE', score: Math.min(0.7 + (positiveCount * 0.1), 0.95) };
    } else if (negativeCount > positiveCount) {
        return { label: 'NEGATIVE', score: Math.min(0.7 + (negativeCount * 0.1), 0.95) };
    } else {
        return { label: 'NEUTRAL', score: 0.5 };
    }
}

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
    
    // Try direct API call first (should work from GitHub Pages)
    // Note: Browser will log CORS errors to console, but we handle them gracefully
    let response;
    let useFallback = false;
    
    try {
        response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(API_TOKEN && { 'Authorization': `Bearer ${API_TOKEN}` })
            },
            body: JSON.stringify({ inputs: userText }),
            mode: 'cors'
        });
    } catch (networkError) {
        // Network or CORS error - silently use fallback
        useFallback = true;
        response = null;
    }
    
    // If fetch failed or returned null, use fallback
    if (!response) {
        useFallback = true;
    }
    
    // If we got a response, check if it's valid
    if (!useFallback && response) {
        if (!response.ok) {
            // If model is loading, wait and retry
            if (response.status === 503) {
                const retryAfter = response.headers.get('Retry-After') || 20;
                showError(`Model is loading. Please wait ${retryAfter} seconds and try again.`);
                return;
            }
            // For other errors, use fallback
            useFallback = true;
        } else {
            try {
                const result = await response.json();
                
                // Handle array response
                const sentimentData = Array.isArray(result) ? result[0] : result;
                
                // Check if result has the expected structure
                if (sentimentData && sentimentData.label) {
                    const label = sentimentData.label;
                    const score = sentimentData.score;
                    
                    // Display results
                    displayResult(label, score);
                    return;
                } else {
                    useFallback = true;
                }
            } catch (parseError) {
                console.log('Failed to parse API response, using fallback...');
                useFallback = true;
            }
        }
    }
    
    // Use fallback analysis if API failed
    if (useFallback) {
        // Silently use fallback - no console errors
        const fallbackResult = simpleSentimentAnalysis(userText);
        displayResult(fallbackResult.label, fallbackResult.score);
        
        // Show a friendly notice that we're using fallback
        setTimeout(() => {
            const errorDiv = document.getElementById('errorMessage');
            errorDiv.textContent = 'ℹ️ Using simplified analysis (Hugging Face API unavailable). Results are approximate but still useful!';
            errorDiv.className = 'error-message';
            errorDiv.style.background = '#e3f2fd';
            errorDiv.style.color = '#1976d2';
            errorDiv.style.border = '1px solid #90caf9';
            errorDiv.classList.remove('hidden');
        }, 100);
        return; // Exit early to prevent any further processing
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
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 300;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Prepare data
    const sentiments = ["POSITIVE", "NEGATIVE", "NEUTRAL"];
    const confidences = sentiments.map(s => {
        if (s === label) {
            return score;
        } else if (s === "NEUTRAL") {
            return Math.max(0, 1 - score * 1.5);
        } else {
            return Math.max(0, 1 - score * 1.5);
        }
    });
    
    // Normalize to ensure they sum to reasonable values
    const maxConf = Math.max(...confidences);
    const normalizedConfidences = confidences.map(c => c / maxConf);
    
    // Chart dimensions
    const chartWidth = canvas.width - 80;
    const chartHeight = canvas.height - 80;
    const barWidth = chartWidth / sentiments.length - 20;
    const startX = 60;
    const startY = 40;
    const maxBarHeight = chartHeight - 40;
    
    // Colors
    const colors = {
        'POSITIVE': { bg: 'rgba(0, 200, 83, 0.7)', border: 'rgba(0, 200, 83, 1)' },
        'NEGATIVE': { bg: 'rgba(211, 47, 47, 0.7)', border: 'rgba(211, 47, 47, 1)' },
        'NEUTRAL': { bg: 'rgba(25, 118, 210, 0.7)', border: 'rgba(25, 118, 210, 1)' }
    };
    
    // Draw bars
    sentiments.forEach((sentiment, index) => {
        const x = startX + index * (chartWidth / sentiments.length);
        const barHeight = normalizedConfidences[index] * maxBarHeight;
        const y = startY + maxBarHeight - barHeight;
        
        // Draw bar
        ctx.fillStyle = colors[sentiment].bg;
        ctx.strokeStyle = colors[sentiment].border;
        ctx.lineWidth = 2;
        ctx.fillRect(x, y, barWidth, barHeight);
        ctx.strokeRect(x, y, barWidth, barHeight);
        
        // Draw label
        ctx.fillStyle = '#333';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(sentiment, x + barWidth / 2, startY + maxBarHeight + 20);
        
        // Draw percentage
        ctx.fillStyle = '#666';
        ctx.font = '11px Arial';
        const percentage = (confidences[index] * 100).toFixed(1);
        ctx.fillText(percentage + '%', x + barWidth / 2, y - 5);
    });
    
    // Draw Y-axis labels
    ctx.fillStyle = '#666';
    ctx.font = '11px Arial';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
        const value = (i / 5) * 100;
        const y = startY + maxBarHeight - (i / 5) * maxBarHeight;
        ctx.fillText(value + '%', startX - 10, y + 4);
    }
    
    // Draw axis lines
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX, startY + maxBarHeight);
    ctx.stroke();
    // X-axis
    ctx.beginPath();
    ctx.moveTo(startX, startY + maxBarHeight);
    ctx.lineTo(startX + chartWidth, startY + maxBarHeight);
    ctx.stroke();
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
