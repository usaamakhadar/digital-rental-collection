import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createAdminClient()

    // Lightweight query to keep Supabase DB warm and active
    const { error } = await supabase
      .from('properties')
      .select('id')
      .limit(1)

    if (error) {
      console.error('[Ping Route] Database query failed:', error.message)
      return NextResponse.json(
        {
          status: 'error',
          message: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        status: 'ok',
        message: 'Pong! Supabase database connection is active.',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[Ping Route] Execution error:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: error?.message || 'Internal Server Error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
