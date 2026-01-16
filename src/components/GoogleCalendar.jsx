import React, { useState, useEffect, useRef } from 'react';

// Google Calendar Component
const GoogleCalendar = React.memo(({ selectedDate }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const tokenClientRef = useRef(null);
  const gapiInitialized = useRef(false);

  // Load credentials from environment variables
  const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
  const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

  useEffect(() => {
    const initializeGapi = () => {
      if (gapiInitialized.current) return;

      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
          });
          gapiInitialized.current = true;

          // Restore token from sessionStorage if available
          const savedToken = sessionStorage.getItem('gcal_token');
          if (savedToken) {
            try {
              const token = JSON.parse(savedToken);
              window.gapi.client.setToken(token);
              setIsSignedIn(true);
            } catch (e) {
              sessionStorage.removeItem('gcal_token');
            }
          }
        } catch (err) {
          console.error('Error initializing GAPI:', err);
          setError('Failed to initialize Google Calendar API');
        }
      });

      // Initialize token client
      if (window.google) {
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (response) => {
            if (response.error) {
              console.error('OAuth error:', response.error);
              setError('Failed to sign in: ' + response.error);
              return;
            }
            if (response.access_token) {
              // Set the token on the GAPI client so API calls are authenticated
              window.gapi.client.setToken(response);
              // Save token to sessionStorage for persistence across navigation
              sessionStorage.setItem('gcal_token', JSON.stringify(response));
              setIsSignedIn(true);
              setError('');
            }
          },
        });
      }
    };

    if (window.gapi && window.google) {
      initializeGapi();
    } else {
      const checkInterval = setInterval(() => {
        if (window.gapi && window.google) {
          initializeGapi();
          clearInterval(checkInterval);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }
  }, []);

  useEffect(() => {
    if (isSignedIn && selectedDate) {
      fetchEvents();
    }
  }, [isSignedIn, selectedDate]);

  const handleSignIn = () => {
    if (tokenClientRef.current) {
      tokenClientRef.current.requestAccessToken();
    }
  };

  const handleSignOut = () => {
    const token = window.gapi.client.getToken();
    if (token) {
      window.google.accounts.oauth2.revoke(token.access_token);
      window.gapi.client.setToken(null);
    }
    sessionStorage.removeItem('gcal_token');
    setIsSignedIn(false);
    setEvents([]);
  };

  const fetchEvents = async () => {
    setIsLoading(true);
    setError('');
    try {
      const date = new Date(2026, selectedDate.month - 1, selectedDate.day);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const response = await window.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
        showDeleted: false,
        singleEvents: true,
        orderBy: 'startTime',
      });

      setEvents(response.result.items || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to fetch calendar events');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateTime) => {
    if (!dateTime) return 'All day';
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  if (!CLIENT_ID || CLIENT_ID === 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
        <p className="font-medium text-yellow-800 mb-2">Google Calendar Setup Required</p>
        <p className="text-yellow-700 mb-2">To enable Google Calendar integration:</p>
        <ol className="list-decimal ml-6 space-y-1 text-yellow-700">
          <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
          <li>Create a new project or select existing one</li>
          <li>Enable Google Calendar API</li>
          <li>Create OAuth 2.0 credentials (Web application)</li>
          <li>Add <code>http://localhost:3000</code> to authorized JavaScript origins</li>
          <li>Create an API Key</li>
          <li>Copy <code>.env.example</code> to <code>.env</code> in the project root</li>
          <li>Add your Client ID and API Key to <code>.env</code> file</li>
          <li>Restart the dev server (<code>npm run dev</code>)</li>
        </ol>
        <p className="text-yellow-700 mt-2 text-xs italic">
          ⚠️ Never commit the <code>.env</code> file to git - it's already in <code>.gitignore</code>
        </p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="bg-transparent rounded-lg">
        <h2
          className="text-3xl mb-4 pb-2 border-b-2 border-amber-800/40"
          style={{ color: '#673147', fontFamily: 'Dancing Script, cursive', fontWeight: 700 }}
        >
          Google Calendar
        </h2>
        <div className="rounded-lg p-4" style={{ backgroundColor: 'rgba(242, 198, 222, 0.3)', border: '1px solid #C4A574' }}>
          <div className="flex items-center justify-between">
            <p className="text-sm" style={{ color: '#673147' }}>Sign in to view your events</p>
            <button
              onClick={handleSignIn}
              className="px-4 py-2 rounded text-sm flex items-center gap-2"
              style={{ backgroundColor: 'rgba(251, 234, 214, 0.7)', border: '1px solid #C4A574', color: '#673147' }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/><path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/><path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/><path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/></svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent rounded-lg">
      <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-amber-800/40">
        <h2
          className="text-3xl"
          style={{ color: '#673147', fontFamily: 'Dancing Script, cursive', fontWeight: 700 }}
        >
          Google Calendar
        </h2>
        <button
          onClick={handleSignOut}
          className="text-xs px-3 py-1 rounded"
          style={{ backgroundColor: 'rgba(251, 234, 214, 0.7)', border: '1px solid #C4A574', color: '#673147' }}
        >
          Sign out
        </button>
      </div>
      <div className="rounded-lg p-4" style={{ backgroundColor: 'rgba(242, 198, 222, 0.3)', border: '1px solid #C4A574' }}>
        {isLoading && <p className="text-sm" style={{ color: '#673147' }}>Loading events...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!isLoading && !error && events.length === 0 && (
          <p className="text-sm italic" style={{ color: '#673147' }}>No events scheduled for this day</p>
        )}

        {!isLoading && events.length > 0 && (
          <div className="space-y-2">
            {events.map((event) => (
              <div
                key={event.id}
                className="border-l-4 pl-3 py-2"
                style={{ borderColor: event.colorId ? '#C5B358' : '#A17188' }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm" style={{ color: '#673147' }}>
                      {event.summary || 'Untitled Event'}
                    </p>
                    <p className="text-xs" style={{ color: '#673147' }}>
                      {formatTime(event.start?.dateTime || event.start?.date)}
                      {event.end?.dateTime && ` - ${formatTime(event.end.dateTime)}`}
                    </p>
                    {event.location && (
                      <p className="text-xs mt-1" style={{ color: '#8B5A6B' }}>📍 {event.location}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default GoogleCalendar;
