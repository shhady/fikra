import { NextResponse } from 'next/server'
import {connectDB} from '@/lib/db'
import Contact from '@/models/Contact'
import { sendNotificationEmail } from '@/lib/mail'

export async function POST(request) {
  try {
    await connectDB();
    
    const data = await request.json();
    const contact = await Contact.create(data);
    
    // Optional: Send notification email
    if (typeof sendNotificationEmail === 'function') {
      await sendNotificationEmail(data);
    }

    return NextResponse.json({ success: true, contact });
  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
} 