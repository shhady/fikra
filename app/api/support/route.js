import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Support from '@/models/Support';
import { sendNotificationEmail } from '@/lib/mail';
import { addLeadToGoogleSheets } from '@/lib/googleSheets';

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

    // Add to Google Sheets
    try {
      await addLeadToGoogleSheets({
        name: data.name,
        email: data.email,
        phone: data.phone,
        source: 'Support Form',
        subject: data.subject,
        message: data.message
      });
    } catch (sheetsError) {
      console.error('Google Sheets error:', sheetsError);
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