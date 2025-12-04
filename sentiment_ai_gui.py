import tkinter as tk
from transformers import pipeline

# Load pre-trained AI model
sentiment_analyzer = pipeline("sentiment-analysis")

# Function to analyze sentiment when Enter is pressed
def analyze_sentiment(event=None):
    user_text = text_entry.get().strip()
    if not user_text:
        result_label.config(text="Please enter a sentence.", fg="gray")
        return

    result = sentiment_analyzer(user_text)[0]
    label = result['label']
    score = result['score']

    # Determine emoji and color
    if label == "POSITIVE":
        color = "#00FF7F"
        emoji = "😄"
    elif label == "NEGATIVE":
        color = "#FF4C4C"
        emoji = "😞"
    else:
        color = "#1E90FF"
        emoji = "😐"

    result_label.config(
        text=f"{emoji} {label}\nConfidence: {score:.2f}",
        fg=color
    )

    # Clear text after analyzing
    text_entry.delete(0, tk.END)

# Create main window
root = tk.Tk()
root.title("🤖 Instant AI Sentiment Analyzer")
root.geometry("420x300")
root.config(bg="#121212")

# Heading
heading = tk.Label(
    root, text="AI Sentiment Analyzer", font=("Arial", 18, "bold"),
    bg="#121212", fg="#00BFFF"
)
heading.pack(pady=15)

# Single-line entry box
text_entry = tk.Entry(root, font=("Arial", 14), width=35, bg="#1E1E1E", fg="white", insertbackground="white", justify="center")
text_entry.pack(pady=20)
text_entry.focus()

# Bind Enter key to analysis function
text_entry.bind("<Return>", analyze_sentiment)

# Result label
result_label = tk.Label(
    root, text="Type a sentence and press Enter ↵", font=("Arial", 14),
    bg="#121212", fg="#888888"
)
result_label.pack(pady=20)

# Footer
footer = tk.Label(
    root, text="Built with ❤️ using Transformers", font=("Arial", 9),
    bg="#121212", fg="#555555"
)
footer.pack(side="bottom", pady=10)

# Run the app
root.mainloop()
