import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// We use the service_role client to bypass RLS for administrative cron tasks
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const key = searchParams.get('key')

    // 1. Authenticate the cron request to prevent abuse/unauthorized triggers
    if (!key || key !== process.env.CRON_SECRET) {
      console.warn('[Cron] Unauthorized cron trigger attempt.')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Cron] Execution started.')

    // 2. Daily task: Update overdue invoices
    console.log('[Cron] Running daily overdue check...')
    const { data: overdueCount, error: overdueError } = await supabaseAdmin.rpc('update_overdue_invoices')
    if (overdueError) {
      console.error('[Cron] Error updating overdue invoices:', overdueError.message)
      return NextResponse.json({ error: `Overdue update failed: ${overdueError.message}` }, { status: 500 })
    }
    console.log(`[Cron] Overdue check complete. Marked ${overdueCount} invoices as OVERDUE.`)

    // 3. Monthly task: Generate monthly invoices (on 1st of month, or if forced via query param)
    const currentDate = new Date()
    const isFirstOfMonth = currentDate.getDate() === 1
    const forceGenerate = searchParams.get('force') === 'true'
    let generatedCount = 0

    if (isFirstOfMonth || forceGenerate) {
      console.log('[Cron] Running monthly invoice generation...')
      const { data: genCount, error: genError } = await supabaseAdmin.rpc('generate_all_monthly_invoices')
      if (genError) {
        console.error('[Cron] Error generating monthly invoices:', genError.message)
        return NextResponse.json({ error: `Monthly billing failed: ${genError.message}` }, { status: 500 })
      }
      generatedCount = genCount as number
      console.log(`[Cron] Monthly billing complete. Generated ${generatedCount} invoices.`)
    } else {
      console.log('[Cron] Skipping monthly billing (not the 1st of the month).')
    }

    console.log('[Cron] Execution finished successfully.')
    return NextResponse.json({
      success: true,
      tasks: {
        overdueMarked: overdueCount,
        monthlyInvoicesGenerated: generatedCount
      }
    }, { status: 200 })

  } catch (error: any) {
    console.error('[Cron] Crash during execution:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
