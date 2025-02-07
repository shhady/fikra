import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Support from '@/models/Support';
import { sendNotificationEmail } from '@/lib/mail';

export async function POST(request) {
  try {
    await connectDB();
    
    const data = await request.json();
    const support = await Support.create(data);
    
    // Send notification email with proper type and data
    try {
      await sendNotificationEmail({
        email: data.email,
        type: 'Support',
        name: data.name,
        phone: data.phone,
        subject: data.subject,
        message: data.message
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
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