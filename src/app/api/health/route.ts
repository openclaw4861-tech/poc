import { NextResponse } from 'next/server';

export async function GET() {
  // TODO: Add database health check when DB is connected
  
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
}
