import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { GMAIL_USER, GMAIL_APP_PASSWORD } = await req.json();
    if (!GMAIL_USER || !GMAIL_APP_PASSWORD)
      return NextResponse.json({ error: 'Email and app password are required' }, { status: 400 });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    });

    await transporter.verify();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid Gmail credentials. Make sure you\'re using an App Password, not your regular password.' }, { status: 400 });
  }
}
