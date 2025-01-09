import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Support from '@/models/Support';
import { sendNotificationEmail } from '@/lib/mail';

export async function POST(request) {
  try {
    await connectDB();
    
    const data = await request.json();
    const support = await Support.create(data);
    
    // Optional: Send notification email
    if (typeof sendNotificationEmail === 'function') {
      await sendNotificationEmail({
        ...data,
        type: 'Support Request'
      });
    }

    return NextResponse.json({ success: true, support });
  } catch (error) {
    console.error('Support API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit support request' },
      { status: 500 }
    );
  }
} 