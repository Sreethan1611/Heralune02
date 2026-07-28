import os
from google import genai
from google.genai import types

def get_gemini_client():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is missing")
    return genai.Client(api_key=api_key)

def stream_chat_response(messages):
    """
    Streams a response using gemini-2.5-flash if available, falling back to gemini-1.5-flash.
    """
    client = get_gemini_client()
    
    # Format messages for the new google-genai SDK
    # It expects: [{'role': 'user', 'parts': [{'text': 'hi'}]}]
    formatted_messages = []
    for m in messages:
        role = 'user' if m.get('role') == 'user' else 'model'
        formatted_messages.append(
            types.Content(role=role, parts=[types.Part.from_text(text=m.get('content', ''))])
        )

    system_instruction = "You are Heralune, a supportive emotional assistant and journal companion. A user is journaling their thoughts. Respond with deep empathy, encouragement, and gentle reflection. Avoid judgment or medical advice. Help them unpack their feelings."

    # In the new SDK (google-genai 0.3.0+), system instructions are passed via config
    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        temperature=0.7,
    )

    try:
        # Try 2.5 flash first
        response = client.models.generate_content_stream(
            model='gemini-2.5-flash',
            contents=formatted_messages,
            config=config
        )
        for chunk in response:
            if chunk.text:
                yield chunk.text
    except Exception as e:
        print(f"gemini-2.5-flash failed: {e}. Falling back to gemini-1.5-flash.")
        try:
            # Fallback to 1.5 flash
            response = client.models.generate_content_stream(
                model='gemini-1.5-flash',
                contents=formatted_messages,
                config=config
            )
            for chunk in response:
                if chunk.text:
                    yield chunk.text
        except Exception as inner_e:
            print(f"Fallback also failed: {inner_e}")
            yield "I'm having trouble connecting to my thoughts right now. Please try again later."
