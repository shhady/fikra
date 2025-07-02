import { NextResponse } from 'next/server';
import { sendChatHistoryEmail } from '@/lib/chatMail';

export async function POST(request) {
  try {
    console.log('Testing email functionality...');
    
    const testChatHistory = `
[${new Date().toLocaleTimeString()}] USER:
Hello, this is a test message

---

[${new Date().toLocaleTimeString()}] ASSISTANT:
Hello! This is a test response from the assistant.

---

[${new Date().toLocaleTimeString()}] USER:
Thank you for the test!
    `;

    await sendChatHistoryEmail(testChatHistory);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test email sent successfully' 
    });
  } catch (error) {
    console.error('Test email failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        details: {
          code: error.code,
          command: error.command,
          response: error.response
        }
      },
      { status: 500 }
    );
  }
} 