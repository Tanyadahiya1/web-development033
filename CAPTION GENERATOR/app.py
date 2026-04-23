from flask import Flask, render_template, request, jsonify
import anthropic
import os
from dotenv import load_dotenv   # ← ADD THIS

load_dotenv()                     # ← ADD THIS TOO


app = Flask(__name__)

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

PLATFORM_STYLES = {
    "instagram": "casual, trendy, uses relevant emojis, includes 5-10 hashtags",
    "twitter": "concise, punchy, under 280 characters, witty, max 2-3 hashtags",
    "linkedin": "professional, insightful, thought-provoking, minimal hashtags",
    "youtube": "engaging, descriptive, click-worthy, includes call-to-action",
    "tiktok": "fun, energetic, youth-oriented, trending slang, 3-5 hashtags"
}

TONE_STYLES = {
    "funny": "humorous, witty, and playful with clever wordplay",
    "inspirational": "motivating, uplifting, and empowering",
    "aesthetic": "dreamy, poetic, artsy, and visually descriptive",
    "professional": "polished, credible, and authoritative",
    "savage": "bold, confident, and unapologetically fierce"
}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/generate", methods=["POST"])
def generate():
    data = request.json
    topic = data.get("topic", "")
    platform = data.get("platform", "instagram")
    tone = data.get("tone", "funny")
    niche = data.get("niche", "lifestyle")
    count = int(data.get("count", 3))

    platform_style = PLATFORM_STYLES.get(platform, PLATFORM_STYLES["instagram"])
    tone_style = TONE_STYLES.get(tone, TONE_STYLES["funny"])

    prompt = f"""You are an expert social media copywriter who creates viral captions for influencers and content creators.

Generate {count} unique, creative captions for a {niche} content creator posting about: "{topic}"

Platform: {platform.capitalize()} — style should be {platform_style}
Tone: {tone.capitalize()} — {tone_style}

Rules:
- Each caption must feel original and scroll-stopping
- Match the platform's culture and character limits
- Include emojis where appropriate
- Add hashtags as specified by platform
- Number each caption clearly (1., 2., 3. etc.)
- Add a blank line between each caption

Make them creative, relatable, and ready to post!"""

    message = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    )

    captions_text = message.content[0].text
    captions = []
    current = []

    for line in captions_text.split("\n"):
        if line.strip() and (line.strip()[0].isdigit() and line.strip()[1] in ".):"):
            if current:
                captions.append("\n".join(current).strip())
            current = [line.strip()]
        elif line.strip():
            current.append(line.strip())
        elif current:
            captions.append("\n".join(current).strip())
            current = []

    if current:
        captions.append("\n".join(current).strip())

    captions = [c for c in captions if c]

    return jsonify({"captions": captions, "raw": captions_text})

if __name__ == "__main__":
    app.run(debug=True, port=5001)