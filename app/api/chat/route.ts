import { NextRequest } from 'next/server';

export const runtime = 'nodejs'; // Use Node.js runtime for streaming support

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, brand, messageCount } = body;

    if (!message) {
      return Response.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check if external API URL is configured
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
    
    if (apiUrl) {
      // Proxy to external backend server
      try {
        const backendUrl = apiUrl.endsWith('/api/chat') ? apiUrl : `${apiUrl}/api/chat`;
        
        const response = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message, brand, messageCount }),
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          console.error('Backend API error:', response.status, errorText);
          return Response.json(
            { error: `Backend API error: ${response.status}`, message: errorText },
            { status: response.status }
          );
        }

        // If it's a streaming response, forward it
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('text/event-stream')) {
          return new Response(response.body, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            },
          });
        }

        return Response.json(await response.json());
      } catch (error: any) {
        console.error('Error proxying to backend:', error);
        return Response.json(
          { error: `Failed to connect to backend API: ${error.message}` },
          { status: 500 }
        );
      }
    }

    // If no external API URL, return error asking for configuration
    return Response.json(
      {
        error: 'API endpoint not configured',
        message: 'Please set NEXT_PUBLIC_API_URL or API_URL environment variable in Vercel to point to your backend server.',
        details: 'The backend server should be deployed separately and handle /api/chat POST requests with streaming support.',
      },
      { status: 503 }
    );
  } catch (error: any) {
    console.error('API route error:', error);
    return Response.json(
      { error: 'Invalid request', message: error.message },
      { status: 400 }
    );
  }
}

