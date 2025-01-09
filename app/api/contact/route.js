import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, message } = body

    // Validate input
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    // Connect to database
    const db = await connectDB()
    
    // Save contact form submission
    await db.collection('contacts').insertOne({
      name,
      email,
      message,
      createdAt: new Date()
    })

    return NextResponse.json(
      { message: 'تم إرسال رسالتك بنجاح' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إرسال الرسالة' },
      { status: 500 }
    )
  }
} 