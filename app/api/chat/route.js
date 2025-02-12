import { OpenAI } from 'openai';
import { CHAT_INSTRUCTIONS } from './instructions';
import { sendChatHistoryEmail } from '@/lib/chatMail';

// Create an OpenAI API client (Azure configuration)
const client = new OpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: process.env.AZURE_OPENAI_API_KEY
});

// Helper function to safely parse request body
async function parseRequest(req) {
  const contentType = req.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    const text = await req.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      return null;
    }
  }
  return null;
}

// New endpoint to handle chat history
export async function PUT(req) {
  return handleChatHistory(req);
}

// Handle POST method for both chat and beacon
export async function POST(req) {
  const contentType = req.headers.get('content-type');
  const accept = req.headers.get('accept');

  // If it's a chat history request (from beacon or regular PUT)
  if (contentType === 'application/json' && !accept?.includes('text/plain')) {
    return handleChatHistory(req);
  }

  // Regular chat request
  try {
    const data = await parseRequest(req);
    if (!data?.messages || !Array.isArray(data.messages)) {
      return new Response('Invalid messages format', { status: 400 });
    }

    console.log('Sending request to Azure OpenAI with messages:', data.messages);

    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: CHAT_INSTRUCTIONS },
        ...data.messages
      ],
      temperature: 0.7,
      max_tokens: 4096,
      top_p: 1,
      stream: true
    });

    // Convert the response into a ReadableStream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(new TextEncoder().encode(content));
            }
          }
          controller.close();
        } catch (error) {
          console.error('Error in stream processing:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error in chat route:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error processing your request',
        details: error.message,
        stack: error.stack
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Helper function to handle chat history
async function handleChatHistory(req) {
  try {
    console.log('Handling chat history request...');
    const data = await parseRequest(req);
    if (!data?.messages) {
      console.error('No messages found in request');
      return new Response('Invalid request format', { status: 400 });
    }
    
    console.log(`Processing ${data.messages.length} messages...`);
    
    // Format chat history with timestamps
    const chatHistory = data.messages.map(msg => 
      `[${new Date().toLocaleTimeString()}] ${msg.role.toUpperCase()}:\n${msg.content}`
    ).join('\n\n---\n\n');

    console.log('Sending email...');
    // Send email with chat history
    await sendChatHistoryEmail(chatHistory);
    console.log('Email sent successfully');

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in handleChatHistory:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
