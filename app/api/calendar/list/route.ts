import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const TIMEZONE = process.env.GOOGLE_CALENDAR_TIMEZONE || 'Asia/Kolkata';

async function getAuthClient() {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!serviceAccountEmail || !privateKey) {
    throw new Error('Google Calendar credentials not configured');
  }

  const auth = new google.auth.JWT({
    email: serviceAccountEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
  });

  return auth;
}

export async function GET(request: NextRequest) {
  try {
    // Check if credentials are configured
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    
    if (!serviceAccountEmail || !privateKey) {
      return NextResponse.json(
        { 
          error: 'Google Calendar credentials not configured',
          details: 'Please set up GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY environment variables.'
        },
        { status: 503 }
      );
    }

    const auth = await getAuthClient();
    const calendar = google.calendar({ version: 'v3', auth });

    // List calendars accessible to the service account
    const response = await calendar.calendarList.list();
    const calendars = response.data.items || [];

    return NextResponse.json({
      serviceAccountEmail: serviceAccountEmail,
      calendars: calendars.map((cal: any) => ({
        id: cal.id,
        summary: cal.summary,
        description: cal.description,
        primary: cal.primary,
        accessRole: cal.accessRole,
        backgroundColor: cal.backgroundColor,
        foregroundColor: cal.foregroundColor,
      })),
      totalCalendars: calendars.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: error.message || 'Failed to list calendars',
        details: error.details || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

