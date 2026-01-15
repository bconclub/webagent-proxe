import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/src/lib/supabaseClient';
import { readFileSync, statSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function checkSupabaseConnection(): Promise<{ status: 'ok' | 'error'; message: string }> {
  try {
    const client = getSupabaseClient('proxe');
    if (!client) {
      return { status: 'error', message: 'Supabase client not configured' };
    }

    // Try a simple query to check connection
    const { error } = await client.from('web_sessions').select('id').limit(1);
    
    if (error) {
      return { status: 'error', message: `Connection failed: ${error.message}` };
    }

    return { status: 'ok', message: 'Connected' };
  } catch (error: any) {
    return { status: 'error', message: error.message || 'Connection failed' };
  }
}

async function checkApiEndpoint(
  url: string, 
  method: 'GET' | 'POST' = 'GET',
  body?: any
): Promise<{ status: 'ok' | 'error'; message: string; responseTime?: number }> {
  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    const responseTime = Date.now() - startTime;

    // For POST endpoints, 405 (Method Not Allowed) or 400 (Bad Request) might still indicate the endpoint exists
    // For GET endpoints, we expect 200-299 or 404 (endpoint exists but might need params)
    if (response.ok || response.status === 404 || response.status === 405 || (method === 'POST' && response.status === 400)) {
      return { status: 'ok', message: `HTTP ${response.status}`, responseTime };
    } else if (response.status >= 500) {
      return { status: 'error', message: `HTTP ${response.status}`, responseTime };
    } else {
      // 4xx errors (except 404/405) might indicate endpoint issues
      return { status: 'error', message: `HTTP ${response.status}`, responseTime };
    }
  } catch (error: any) {
    return { 
      status: 'error', 
      message: error.message || 'Request failed',
      responseTime: undefined
    };
  }
}

function getBuildId(): string | null {
  try {
    // Try to read from .next/BUILD_ID
    const buildIdPath = join(process.cwd(), '.next', 'BUILD_ID');
    const buildId = readFileSync(buildIdPath, 'utf-8').trim();
    return buildId;
  } catch {
    // BUILD_ID might not exist in development
    return null;
  }
}

function getGitCommitHash(): string | null {
  try {
    const hash = execSync('git rev-parse HEAD', { 
      encoding: 'utf-8',
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
    return hash.substring(0, 7); // Short hash
  } catch {
    return null;
  }
}

function getDeployTime(): string | null {
  // Try to get from environment variable first
  if (process.env.DEPLOY_TIME) {
    return process.env.DEPLOY_TIME;
  }

  // Try to get from .next/BUILD_ID file modification time
  try {
    const buildIdPath = join(process.cwd(), '.next', 'BUILD_ID');
    const stats = statSync(buildIdPath);
    return stats.mtime.toISOString();
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  // Determine base URL for API checks
  let baseUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!baseUrl) {
    if (process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`;
    } else {
      // Use the request URL to determine the base URL
      const url = new URL(request.url);
      baseUrl = `${url.protocol}//${url.host}`;
    }
  }

  // Check all services in parallel
  // Chat API is POST, so we'll check with a minimal POST request (it will return 400 for empty message, but that confirms endpoint exists)
  // Calendar list is GET
  const [supabaseStatus, chatApiStatus, calendarApiStatus] = await Promise.all([
    checkSupabaseConnection(),
    checkApiEndpoint(`${baseUrl}/api/chat`, 'POST', { message: '' }).catch(() => ({ status: 'error' as const, message: 'Request failed' })),
    checkApiEndpoint(`${baseUrl}/api/calendar/list`, 'GET').catch(() => ({ status: 'error' as const, message: 'Request failed' })),
  ]);

  // Determine overall system status
  const allServicesOk = 
    supabaseStatus.status === 'ok' &&
    chatApiStatus.status === 'ok' &&
    calendarApiStatus.status === 'ok';

  return NextResponse.json({
    system: {
      status: allServicesOk ? 'operational' : 'degraded',
      timestamp: new Date().toISOString(),
    },
    database: supabaseStatus,
    apiEndpoints: {
      chat: chatApiStatus,
      calendar: calendarApiStatus,
    },
    version: {
      buildId: getBuildId(),
      gitCommit: getGitCommitHash(),
      deployTime: getDeployTime(),
    },
  });
}
