import { OpenAI } from 'openai';
import { CHAT_INSTRUCTIONS } from './instructions';
import { sendChatHistoryEmail } from '@/lib/chatMail';
import { addLeadToGoogleSheets } from '@/lib/googleSheets';

// Create an OpenAI API client (Standard OpenAI configuration)
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
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

// Helper function to extract user details
function extractUserDetails(message) {
  // Clean up the message but preserve newlines for structured format
  const cleanMessage = message.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();

  // Labels in different languages
  const nameLabels = ['name', 'الاسم', 'שם', 'اسم', 'Name'];
  const emailLabels = ['email', 'البريد الالكتروني', 'דואר אלקטרוני', 'ايميل', 'بريد', 'Email'];
  const phoneLabels = ['phone', 'رقم الهاتف', 'טלפון', 'هاتف', 'جوال', 'موبايل', 'Phone'];

  // Try to match the format with ** and newlines (like in the message)
  const boldPattern = new RegExp(`\\*\\*(${nameLabels.join('|')})\\*\\*:\\s*([^\\n]+)\\s*\\*\\*(${emailLabels.join('|')})\\*\\*:\\s*([^\\n]+)\\s*\\*\\*(${phoneLabels.join('|')})\\*\\*:\\s*([^\\n]+)`, 'i');
  const boldMatch = message.match(boldPattern);
  if (boldMatch) {
    return {
      name: boldMatch[2].trim(),
      email: boldMatch[4].trim(),
      phone: boldMatch[6].trim(),
      source: 'Chat Bot'
    };
  }

  // Try structured format with newlines
  const newlinePattern = new RegExp(`(?:${nameLabels.join('|')})\\s*:?\\s*([^\\n]+)\\s*(?:${emailLabels.join('|')})\\s*:?\\s*([^\\n]+)\\s*(?:${phoneLabels.join('|')})\\s*:?\\s*([^\\n]+)`, 'i');
  const structuredMatch = message.match(newlinePattern);
  if (structuredMatch) {
    return {
      name: structuredMatch[1].trim(),
      email: structuredMatch[2].trim(),
      phone: structuredMatch[3].trim(),
      source: 'Chat Bot'
    };
  }

  // Try comma-separated format (name, email, phone)
  const commaMatch = cleanMessage.match(/([^,]+),\s*([^,]+@[^,\s]+),\s*([+\d\s\-\(\)]+)/);
  if (commaMatch) {
    const phone = commaMatch[3].replace(/[^\d+]/g, '');
    if (phone.length >= 9) { // Validate phone number length
      return {
        name: commaMatch[1].trim(),
        email: commaMatch[2].trim(),
        phone: phone,
        source: 'Chat Bot'
      };
    }
  }

  // Try to extract email first, then find name and phone around it
  const emailMatch = message.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i);
  if (emailMatch) {
    const email = emailMatch[1];
    
    // Find phone number in the message
    const phoneMatches = message.match(/(\+?\d[\d\s\-\(\)]{8,})/g);
    let validPhone = null;
    
    if (phoneMatches) {
      for (const phoneCandidate of phoneMatches) {
        const cleanPhone = phoneCandidate.replace(/[^\d+]/g, '');
        if (cleanPhone.length >= 9) {
          validPhone = cleanPhone;
          break;
        }
      }
    }
    
    if (validPhone) {
      // Try to extract name - look for text before email or after common patterns
      let name = '';
      
      // Split message into parts and look for name
      const parts = message.split(/[\s,\.]+/).filter(part => part.length > 1);
      const emailIndex = parts.findIndex(part => part.includes('@'));
      
      if (emailIndex > 0) {
        // Take words before email as potential name
        const nameParts = parts.slice(0, emailIndex).filter(part => 
          !part.match(/^\d+$/) && // not just numbers
          !part.match(/^[+\d\-\(\)\s]+$/) && // not phone number
          ![...nameLabels, ...emailLabels, ...phoneLabels].some(label => 
            part.toLowerCase().includes(label.toLowerCase())
          ) // not labels
        );
        
        if (nameParts.length > 0) {
          name = nameParts.join(' ').trim();
        }
      }
      
      // If no name found before email, try after
      if (!name && emailIndex < parts.length - 1) {
        const namePartsAfter = parts.slice(emailIndex + 1).filter(part => 
          !part.match(/^\d+$/) && // not just numbers
          !part.match(/^[+\d\-\(\)\s]+$/) && // not phone number
          ![...nameLabels, ...emailLabels, ...phoneLabels].some(label => 
            part.toLowerCase().includes(label.toLowerCase())
          ) // not labels
        );
        
        if (namePartsAfter.length > 0) {
          name = namePartsAfter.join(' ').trim();
        }
      }
      
      // Try alternative approach: look for patterns like "name email phone"
      if (!name) {
        const simplePattern = message.match(/([a-zA-Z]+\s+[a-zA-Z]+)[\s,]*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)[\s,]*([+\d\s\-\(\)]+)/i);
        if (simplePattern) {
          name = simplePattern[1].trim();
        }
      }
      
      if (name && name.length > 1) {
        return {
          name: name,
          email: email,
          phone: validPhone,
          source: 'Chat Bot'
        };
      }
    }
  }

  return null;
}

// New endpoint to handle chat history
export async function PUT(req) {
  return handleChatHistory(req);
}
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

    // Before streaming, check if the last message contains user details
    const lastMessage = data.messages[data.messages.length - 1];
    console.log('🔍 Checking last message for user details:', lastMessage.content);
    const userDetails = extractUserDetails(lastMessage.content);
    
    if (userDetails) {
      console.log('✅ User details extracted:', userDetails);
      // Log the validation checks
      const validationChecks = {
        hasValidEmail: userDetails.email && userDetails.email.includes('@'),
        hasValidName: userDetails.name && userDetails.name.length > 0,
        hasValidPhone: userDetails.phone && userDetails.phone.length >= 9,
        email: userDetails.email,
        name: userDetails.name,
        phone: userDetails.phone
      };
      console.log('Validation checks:', validationChecks);

      // Validate user details before storing
      if (validationChecks.hasValidEmail && validationChecks.hasValidName && validationChecks.hasValidPhone) {
        try {
          console.log('📝 Attempting to store lead in Google Sheets...');
          const result = await addLeadToGoogleSheets(userDetails);
          console.log('✅ Lead stored successfully:', result);
        } catch (error) {
          console.error('❌ Failed to store lead:', error);
          // Log specific error details
          if (error.response) {
            console.error('Google Sheets API Error:', {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data
            });
          }
        }
      } else {
        console.log('❌ Invalid user details format:', validationChecks);
      }
    } else {
      console.log('❌ No user details found in message');
      // Log the attempted patterns
      console.log('Message patterns attempted:');
      console.log('- Bold pattern match:', lastMessage.content.match(/\*\*(Name|Email|Phone)\*\*:/i) !== null);
      console.log('- Structured pattern match:', lastMessage.content.match(/(Name|Email|Phone):/i) !== null);
      console.log('- Comma pattern match:', lastMessage.content.includes(','));
      console.log('- Email pattern match:', lastMessage.content.match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+/i) !== null);
    }

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
