import { google } from 'googleapis';

// Initialize the Google Calendar API client
const initializeGoogleCalendar = async (credentials) => {
  const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];
  
  const auth = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    SCOPES
  );

  return google.calendar({ version: 'v3', auth });
};

// Create a calendar event with Google Meet
export const createCalendarEvent = async (credentials, eventDetails) => {
    try {
      // Get OAuth2 token first
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: generateJWT(credentials)
        })
      });
  
      const { access_token } = await tokenResponse.json();
  
      // Create calendar event
      const event = {
        summary: `Interview with ${eventDetails.candidateName}`,
        description: `Interview call with ${eventDetails.candidateName} for ${eventDetails.company}`,
        start: {
          dateTime: eventDetails.startTime,
          timeZone: eventDetails.timeZone
        },
        end: {
          dateTime: eventDetails.endTime,
          timeZone: eventDetails.timeZone
        },
        attendees: [
          { email: eventDetails.candidateEmail },
          { email: eventDetails.recruiterEmail }
        ],
        conferenceData: {
          createRequest: {
            requestId: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' }
          }
        }
      };
  
      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event)
        }
      );
  
      const data = await response.json();
      
      return {
        eventLink: data.htmlLink,
        meetLink: data.conferenceData?.entryPoints?.[0]?.uri
      };
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  };

  // Helper function to generate JWT
function generateJWT(credentials) {
    // For security reasons, we'll use a JWT library that works in browser
    // You'll need to add this package: npm install jwt-encode
    const jwt = require('jwt-encode');
    
    const now = Math.floor(Date.now() / 1000);
    
    const claims = {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/calendar.events',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    };
  
    return jwt(claims, credentials.private_key);
  }