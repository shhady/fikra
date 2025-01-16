import { NextResponse } from 'next/server'
import crypto from 'crypto'

const CHATBASE_SECRET = process.env.CHATBASE_SECRET

export async function POST(request) {
  try {
    const { userId, userEmail } = await request.json()

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create HMAC
    const hmac = crypto.createHmac('sha256', CHATBASE_SECRET)
    hmac.update(userId + userEmail)
    const signature = hmac.digest('hex')

    return NextResponse.json({ signature })
  } catch (error) {
    console.error('Chatbase auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
} 