import { NextResponse } from 'next/server'
import {connectDB} from '@/lib/db'
import Contact from '@/models/Contact'
import { sendNotificationEmail } from '@/lib/mail'
import { addLeadToGoogleSheets } from '@/lib/googleSheets'

export async function POST(request) {
  try {
    await connectDB();
    
    const data = await request.json();
    const contact = await Contact.create(data);
    
    // Send notification email with proper type and data
    try {
      await sendNotificationEmail({
        email: data.email,
        type: 'Contact',
        name: data.name,
        phone: data.phone,
        service: data.service,
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
        source: 'Contact Form',
        subject: data.service,
        message: data.message
      });
    } catch (sheetsError) {
      console.error('Google Sheets error:', sheetsError);
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