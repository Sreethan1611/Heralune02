import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30; // Allow streaming responses up to 30 seconds

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const result = streamText({
      model: google('gemini-1.5-flash'),
      messages,
      system: "You are Heralune, a supportive emotional assistant and journal companion. A user is journaling their thoughts. Respond with deep empathy, encouragement, and gentle reflection. Avoid judgment or medical advice. Help them unpack their feelings.",
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
