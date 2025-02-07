import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Newsletter from '@/models/Newsletter';
import { sendNotificationEmail } from '@/lib/mail';

export async function POST(request) {
  try {
    await connectDB();
    
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مطلوب' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingSubscriber = await Newsletter.findOne({ email });
    
    if (existingSubscriber) {
      if (existingSubscriber.isSubscribed) {
        return NextResponse.json(
          { error: 'أنت مشترك بالفعل في النشرة البريدية' },
          { status: 400 }
        );
      } else {
        // Resubscribe
        existingSubscriber.isSubscribed = true;
        await existingSubscriber.save();
        return NextResponse.json({ 
          success: true, 
          message: 'تم إعادة اشتراكك بنجاح' 
        });
      }
    }

    // Create new subscriber
    const subscriber = await Newsletter.create({ email });

    // Send welcome email with detailed error logging
    try {
      console.log('Attempting to send email to:', process.env.MY_EMAIL);
      console.log('From email:', process.env.EMAIL_USER);
      
      await sendNotificationEmail({
        email,
        type: 'Newsletter',
        message: 'شكراً لاشتراكك في نشرتنا البريدية'
      });
      
      console.log('Email sent successfully');
    } catch (emailError) {
      console.error('Detailed email error:', emailError);
      console.error('Email configuration:', {
        emailUser: process.env.EMAIL_USER,
        toEmail: process.env.MY_EMAIL,
        // Don't log the password
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'تم الاشتراك بنجاح' 
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء الاشتراك' },
      { status: 500 }
    );
  }
} 