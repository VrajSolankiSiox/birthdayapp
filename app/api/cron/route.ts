import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';

export async function GET(req: Request) {
  try {
    // 1. Authenticate Cron Execution
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. Determine dates
    const todayDate = new Date();
    const tDay = todayDate.getDate();
    const tMonth = todayDate.getMonth() + 1;

    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tmDay = tomorrowDate.getDate();
    const tmMonth = tomorrowDate.getMonth() + 1;

    // 3. Find birthdays for today & tomorrow
    const [birthdaysToday, birthdaysTomorrow] = await Promise.all([
      prisma.birthday.findMany({ where: { month: tMonth, day: tDay } }),
      prisma.birthday.findMany({ where: { month: tmMonth, day: tmDay } })
    ]);

    const allAlerts = [
      ...birthdaysToday.map(b => ({ ...b, isToday: true })),
      ...birthdaysTomorrow.map(b => ({ ...b, isToday: false }))
    ];

    if (allAlerts.length === 0) {
      return NextResponse.json({ success: true, message: 'No birthdays today or tomorrow.' });
    }

    // 4. Configure Email Transporter via OAuth2
    const OAuth2 = google.auth.OAuth2;
    const oauth2Client = new OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    const accessToken = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          reject("Failed to create access token: " + err);
        }
        resolve(token);
      });
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GOOGLE_EMAIL,
        accessToken: accessToken as string,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN
      }
    });

    // 5. Send Emails
    let emailsSent = 0;
    const targetEmailEnv = process.env.TARGET_EMAIL;
    
    if (!targetEmailEnv) {
      return NextResponse.json({ success: false, message: 'TARGET_EMAIL is not configured in .env' });
    }

    const targetEmail = targetEmailEnv.split(',').map((e) => e.trim()).filter(Boolean).join(', ');

    for (const alert of allAlerts) {
      const dayWord = alert.isToday ? "today" : "tomorrow";
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const dateText = `${monthNames[alert.month - 1]} ${alert.day}`;
      
      // Dynamic Theme
      const titleColor = alert.isToday ? "#ff6b6b" : "#f97316";
      const bgColor = alert.isToday ? "#fff0f0" : "#fff9f0";
      const titleText = alert.isToday ? "🎉 IT'S TODAY! 🎂" : "⏳ UPCOMING TOMORROW! 🎈";
      const subjectText = alert.isToday ? `🎈 IT'S TODAY: ${alert.name}'s Birthday!` : `⏳ Reminder: ${alert.name}'s Birthday is Tomorrow!`;

      try {
        await transporter.sendMail({
          from: process.env.GOOGLE_EMAIL,
          to: targetEmail,
          subject: subjectText,
          text: `Hi Team,\n\nJust a quick reminder that ${dayWord} (${dateText}) is ${alert.name}'s Birthday!\n\nBest regards,\nCrafted with ❤️ by Vraj`,
          html: `<!DOCTYPE html>
                  <html>
                  <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <meta name="color-scheme" content="light">
                  </head>
                  <body style="margin: 0; padding: 0; background-color: #f4f6f8;">
                    <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f8; padding: 15px;">
                      <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); text-align: center; border-top: 6px solid ${titleColor};">
                        
                        <div style="background-color: ${bgColor}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                            <h1 style="color: ${titleColor}; margin: 0; font-size: 22px;">${titleText}</h1>
                        </div>
                        
                        <p style="font-size: 16px; color: #555; margin: 20px 0;">
                          Just a quick reminder that ${dayWord} (<strong style="color: ${titleColor};">${dateText}</strong>) is
                        </p>
                        
                        <p style="font-size: 26px; font-weight: 800; color: #222; margin: 10px 0;">
                          ${alert.name}'s Birthday!
                        </p>
                      
                        <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
                        
                        <p style="font-size: 13px; color: #aaa;">
                          Best regards,<br/>
                          <strong>Crafted with ❤️ by Vraj</strong>
                        </p>
                      
                      </div>
                    </div>
                  </body>
                  </html>`,
        });
        emailsSent++;
      } catch (err) {
        console.error(`Failed to send email regarding ${alert.name}:`, err);
      }
    }

    return NextResponse.json({ success: true, message: `Checked birthdays. Sent ${emailsSent} reminder emails to ${targetEmail}.` });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
