
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Attempt to query a non-existent table to verify connectivity
    // If connection is successful, Supabase will return a response (even if it's an error about the table)
    const { data, error } = await supabase.from('health_check').select('*').limit(1);

    // Check specific error codes to determine status
    const isConnected = !error || error.code === 'PGRST204' || error.code === '42P01'; // 42P01 is "relation does not exist"

    return NextResponse.json({
      success: true,
      message: 'Supabase client initialized',
      connectionStatus: isConnected ? 'Connected' : 'Error',
      details: {
        data,
        error
      }
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: 'Client initialization or network error',
      error: err.message
    }, { status: 500 });
  }
}
