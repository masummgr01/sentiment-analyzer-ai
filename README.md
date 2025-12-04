# 🤖 AI Sentiment Analyzer

A web-based sentiment analysis tool that uses AI to analyze the sentiment of text input. This version is optimized for GitHub Pages deployment.

## Features

- ✨ Real-time sentiment analysis
- 📊 Visual confidence charts
- 🎨 Beautiful, modern UI
- 📱 Responsive design
- ⚡ Fast and lightweight

## How to Deploy to GitHub Pages

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Add sentiment analyzer for GitHub Pages"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Click on **Settings**
   - Scroll down to **Pages** section
   - Under **Source**, select the branch (usually `main` or `master`)
   - Select the folder (usually `/ (root)`)
   - Click **Save**

3. **Wait for deployment**
   - GitHub Pages will build and deploy your site
   - Your site will be available at: `https://yourusername.github.io/repository-name/`

## Local Development

To test locally, simply open `index.html` in your web browser or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

Then visit `http://localhost:8000` in your browser.

## How It Works

This application uses the Hugging Face Inference API to perform sentiment analysis. The model used is `distilbert-base-uncased-finetuned-sst-2-english`, which is a lightweight and fast sentiment analysis model.

## API Rate Limits

The Hugging Face Inference API has rate limits for free usage:
- Without API token: Limited requests
- With API token: Higher rate limits

To use your own API token:
1. Get a token from [Hugging Face](https://huggingface.co/settings/tokens)
2. Add it to `script.js` in the `API_TOKEN` variable (optional, for higher limits)

## Files Structure

```
.
├── index.html      # Main HTML file
├── styles.css      # Styling
├── script.js       # JavaScript logic and API calls
└── README.md       # This file
```

## Note

This is a static version of the original Streamlit app. The original Python/Streamlit version (`sentiment_ai_web.py`) requires a Python server and cannot run on GitHub Pages. For deploying Streamlit apps, consider using [Streamlit Cloud](https://streamlit.io/cloud).

## License

Free to use and modify.
