# Google Calendar API Configuration

To use the custom calendar booking widget, you need to set up Google Calendar API credentials.

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# Google Service Account Email (from your service account JSON)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com

# Google Service Account Private Key (from your service account JSON)
# Note: Replace \n with actual newlines or use \\n in the env var
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Google Calendar ID (email address of the calendar to use)
# Default: bconclubx@gmail.com
GOOGLE_CALENDAR_ID=bconclubx@gmail.com

# Timezone for calendar events (IANA timezone name)
# Default: Asia/Kolkata
GOOGLE_CALENDAR_TIMEZONE=Asia/Kolkata
```

## Setup Instructions

1. **Create a Google Service Account:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google Calendar API
   - Create a Service Account
   - Download the JSON key file

2. **Share Calendar with Service Account:**
   - Open Google Calendar
   - Go to Settings → Settings for my calendars
   - Select the calendar you want to use
   - Go to "Share with specific people"
   - Add the service account email (from the JSON file)
   - Give it "Make changes to events" permission

3. **Extract Credentials from JSON:**
   - Open the downloaded JSON file
   - Copy the `client_email` value → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - Copy the `private_key` value → `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
   - Make sure to preserve newlines in the private key (use `\n` in .env file)

4. **Set Calendar ID:**
   - Use the email address of the calendar you want to book events in
   - Or use the calendar ID from Google Calendar settings

## Available Time Slots

The calendar widget checks availability for these time slots:
- 11:00 AM
- 1:00 PM
- 3:00 PM
- 4:00 PM
- 5:00 PM
- 6:00 PM

Each booking is 1 hour in duration.

## Notes

- The timezone is set to Asia/Kolkata (UTC+5:30) by default
- All time slots are checked against existing calendar events
- Booked slots are automatically greyed out in the widget
- The service account must have write access to the calendar

