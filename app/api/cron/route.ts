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
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tmDay = tomorrowDate.getDate();
    const tmMonth = tomorrowDate.getMonth() + 1;

    // 3. Find birthdays & anniversaries for tomorrow
    const birthdaysTomorrow = await prisma.birthday.findMany({ where: { month: tmMonth, day: tmDay } });

    // Fetch anniversaries using raw query (handles multiple collection names)
    let anniversariesTomorrow: any[] = [];

    const collectionNames = ["anniversaries", "Anniversary", "anniversary"];
    for (const collection of collectionNames) {
      try {
        const resultTomorrow = await prisma.$runCommandRaw({
          find: collection,
          filter: { month: tmMonth, day: tmDay },
          sort: { month: 1, day: 1 },
        }) as any;

        const docsTomorrowBatch = resultTomorrow?.cursor?.firstBatch;
        if (Array.isArray(docsTomorrowBatch) && docsTomorrowBatch.length > 0) {
          anniversariesTomorrow = docsTomorrowBatch.map((doc: any) => ({
            id: doc._id?.toString() ?? doc.id,
            name: doc.name ?? "",
            email: doc.email ?? "",
            company: doc.company ?? "",
            jobTitle: doc.jobTitle ?? "",
            department: doc.department ?? doc.sector ?? "",
            month: doc.month,
            day: doc.day,
            year: doc.year ?? undefined,
          }));
        }

        if (anniversariesTomorrow.length > 0) {
          break;
        }
      } catch (error) {
        // Ignore and try next collection name
      }
    }

    const allAlerts = [
      ...birthdaysTomorrow.map(b => ({ ...b, isToday: false, type: 'birthday' })),
      ...anniversariesTomorrow.map(a => ({ ...a, isToday: false, type: 'anniversary' }))
    ];

    if (allAlerts.length === 0) {
      return NextResponse.json({ success: true, message: 'No birthdays or anniversaries tomorrow.' });
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
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    for (const alert of allAlerts) {
      const dayWord = alert.isToday ? "today" : "tomorrow";
      const dateText = `${monthNames[alert.month - 1]} ${alert.day}`;
      
      // Calculate years of service for anniversaries
      let yearsOfService = "";
      if (alert.type === 'anniversary' && alert.year) {
        const currentYear = new Date().getFullYear();
        const years = currentYear - alert.year;
        yearsOfService = years > 0 ? ` completing ${years} year${years > 1 ? 's' : ''}` : "";
      }

      // Dynamic Theme based on type and timing
      let titleColor, bgColor, titleText, subjectText, emailBody;

      if (alert.type === 'birthday') {
        titleColor = alert.isToday ? "#ff6b6b" : "#f97316";
        bgColor = alert.isToday ? "#fff0f0" : "#fff9f0";
        titleText = alert.isToday ? "🎉 IT'S TODAY! 🎂" : "⏳ UPCOMING TOMORROW! 🎈";
        subjectText = alert.isToday ? `🎈 IT'S TODAY: ${alert.name}'s Birthday!` : `⏳ Reminder: ${alert.name}'s Birthday is Tomorrow!`;
        emailBody = `${alert.name}'s Birthday!`;
      } else {
        titleColor = alert.isToday ? "#4f46e5" : "#06b6d4";
        bgColor = alert.isToday ? "#f0f4ff" : "#f0fdfa";
        titleText = alert.isToday ? "🎊 CELEBRATION TODAY! 💼" : "⏳ MILESTONE TOMORROW! 🏆";
        subjectText = alert.isToday ? `🎊 IT'S TODAY: ${alert.name}'s Work Anniversary!${yearsOfService}` : `⏳ Reminder: ${alert.name}'s Work Anniversary is Tomorrow!${yearsOfService}`;
        emailBody = `${alert.name}'s Work Anniversary${yearsOfService}`;
      }

      try {
        const htmlContent = alert.type === 'birthday' 
          ? `<!DOCTYPE html>
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
                      ${emailBody}
                    </p>
                  
                    <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
                    
                    <p style="font-size: 13px; color: #aaa;">
                      Best regards,<br/>
                      <strong>Crafted by Vraj</strong>
                    </p>
                  
                  </div>
                </div>
              </body>
              </html>`
          : `<!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta name="color-scheme" content="light">
              </head>
              <body style="margin: 0; padding: 0; background-color: #f4f6f8;">
                <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f8; padding: 15px;">
                  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); text-align: center; border-top: 6px solid ${titleColor};">
                    
                    <div style="background-color: ${bgColor}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <h1 style="color: ${titleColor}; margin: 0; font-size: 22px;">${titleText}</h1>
                    </div>
                    
                    <p style="font-size: 16px; color: #555; margin: 20px 0;">
                      Just a quick reminder that ${dayWord} (<strong style="color: ${titleColor};">${dateText}</strong>) is
                    </p>
                    
                    <p style="font-size: 26px; font-weight: 800; color: #222; margin: 10px 0;">
                      ${emailBody}
                    </p>

                    <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: left;">
                      <p style="margin: 8px 0; font-size: 14px; color: #555;">
                        <strong>Employee:</strong> ${alert.name}
                      </p>
                      <p style="margin: 8px 0; font-size: 14px; color: #555;">
                        <strong>Company:</strong> ${alert.company}
                      </p>
                      <p style="margin: 8px 0; font-size: 14px; color: #555;">
                        <strong>Position:</strong> ${alert.jobTitle}
                      </p>
                      <p style="margin: 8px 0; font-size: 14px; color: #555;">
                        <strong>Department:</strong> ${alert.department}
                      </p>
                      ${alert.year ? `<p style="margin: 8px 0; font-size: 14px; color: #555;">
                        <strong>Years of Service:</strong> ${new Date().getFullYear() - alert.year} year${new Date().getFullYear() - alert.year > 1 ? 's' : ''}
                      </p>` : ''}
                    </div>
                  
                    <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
                    
                    <p style="font-size: 13px; color: #aaa;">
                      Best regards,<br/>
                      <strong>Crafted by Vraj</strong>
                    </p>
                  
                  </div>
                </div>
              </body>
              </html>`;

        await transporter.sendMail({
          from: process.env.GOOGLE_EMAIL,
          to: targetEmail,
          subject: subjectText,
          text: `Hi Team,\n\nJust a quick reminder that ${dayWord} (${dateText}) is ${emailBody}!\n\nBest regards,\nCrafted by Vraj`,
          html: htmlContent
        });
        emailsSent++;
      } catch (err) {
        console.error(`Failed to send email regarding ${alert.name}:`, err);
      }
    }

    return NextResponse.json({ success: true, message: `Checked birthdays and anniversaries. Sent ${emailsSent} reminder emails to ${targetEmail}.` });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
