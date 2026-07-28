import os
from flask import Flask, request, Response, jsonify
from flask_cors import CORS
from models import db, User, JournalEntry, EmotionLog, AIInsight
from gemini_service import stream_chat_response
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Database config
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'heralune.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Create tables
with app.app_context():
    db.create_all()

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"}), 200

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Expects JSON: { "messages": [ {"role": "user", "content": "..."}, ... ] }
    Returns a stream of text using server-sent events or direct chunked response.
    """
    data = request.json
    if not data or 'messages' not in data:
        return jsonify({"error": "Missing messages"}), 400
        
    messages = data['messages']
    
    # We will return a streaming response compatible with the Vercel AI SDK
    # The Vercel AI SDK expects a specific format (Data Stream Protocol) 
    # But for a raw stream of text blocks, we can just yield text. 
    # Vercel AI SDK `useChat` can handle simple text streams if configured, 
    # but the official Vercel protocol uses specific prefixes (like `0:` for text).
    
    def generate():
        for chunk in stream_chat_response(messages):
            # Vercel AI SDK expects data stream format: "0:" followed by JSON string of the text chunk
            # e.g. 0:"Hello"
            # It expects each chunk to end with a newline.
            import json
            yield f'0:{json.dumps(chunk)}\n'
            
    return Response(generate(), mimetype='text/plain', headers={
        'X-Vercel-AI-Data-Stream': 'v1',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)
