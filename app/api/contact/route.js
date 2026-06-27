import { NextResponse } from 'next/server'
import { ContactValidationError, sendContactEmail } from '@/lib/contactEmail.mjs'

export async function POST(request) {
  try {
    const data = await request.json();
    await sendContactEmail(data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact API Error:', error);

    if (error instanceof ContactValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
} 
