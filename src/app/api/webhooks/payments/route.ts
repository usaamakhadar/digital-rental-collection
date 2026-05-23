import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// We use the service_role client to bypass RLS since webhooks come from external telecom services.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    // 1. Signature/Auth check (Telesom/Somtel API verification)
    const signature = req.headers.get('x-telecom-signature')
    if (!signature || signature !== process.env.TELECOM_WEBHOOK_SECRET) {
      console.warn('[Webhook] Unauthorized signature attempt.')
      return NextResponse.json({ error: 'Unauthorized signature' }, { status: 401 })
    }

    const payload = await req.json()
    const { transactionId, phone, amount, method } = payload

    if (!transactionId || !phone || !amount || !method) {
      console.warn('[Webhook] Missing payload parameters.')
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Normalizing phone number (Format: e.g. 63XXXXXXX or 65XXXXXXX)
    // Strip space, leading +252, 00252, or 0
    const cleanPhone = phone.replace(/[\s\+]/g, '').replace(/^252|^00252|^0/, '')

    console.log(`[Webhook] Payment notification received. Transaction ID: ${transactionId}, Phone: ${cleanPhone}, Amount: ${amount}, Method: ${method}`)

    // 2. Idempotency Check: check if transaction already processed
    const { data: existingPayment } = await supabaseAdmin
      .from('payments')
      .select('id')
      .eq('provider_transaction_id', transactionId)
      .maybeSingle()

    if (existingPayment) {
      console.log(`[Webhook] Duplicate payment ignored. Transaction ${transactionId} already processed.`)
      return NextResponse.json({ status: 'Processed', duplicate: true }, { status: 200 })
    }

    // 3. Find Tenant by phone number
    const { data: tenant } = await supabaseAdmin
      .from('tenants')
      .select('id, organization_id')
      .eq('phone', cleanPhone)
      .maybeSingle()

    if (!tenant) {
      console.warn(`[Webhook] Tenant not found for phone: ${cleanPhone}`)
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // 4. Find the active Lease for this tenant
    const { data: lease } = await supabaseAdmin
      .from('leases')
      .select('id')
      .eq('tenant_id', tenant.id)
      .eq('status', 'ACTIVE')
      .maybeSingle()

    if (!lease) {
      console.warn(`[Webhook] No active lease found for tenant: ${tenant.id}`)
      return NextResponse.json({ error: 'No active lease found' }, { status: 404 })
    }

    // 5. Find the oldest PENDING invoice for this lease
    const { data: invoice } = await supabaseAdmin
      .from('invoices')
      .select('id, organization_id')
      .eq('lease_id', lease.id)
      .eq('status', 'PENDING')
      .order('due_date', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (!invoice) {
      console.warn(`[Webhook] No pending invoice found for lease: ${lease.id}`)
      return NextResponse.json({ error: 'No pending invoice found' }, { status: 404 })
    }

    // 6. Find a landlord user associated with this organization to run the trigger context
    const { data: landlord } = await supabaseAdmin
      .from('landlords')
      .select('id')
      .eq('organization_id', invoice.organization_id)
      .limit(1)
      .single()

    if (!landlord) {
      console.warn(`[Webhook] No active landlord found for organization: ${invoice.organization_id}`)
      return NextResponse.json({ error: 'No landlord user associated with organization' }, { status: 404 })
    }

    // 7. Execute atomic payment recording and invoice update via Stored Procedure (RPC)
    const { error: rpcError } = await supabaseAdmin.rpc('process_payment', {
      p_invoice_id: invoice.id,
      p_amount: Number(amount),
      p_transaction_id: transactionId,
      p_method: method.toUpperCase(),
      p_landlord_id: landlord.id
    })

    if (rpcError) {
      console.error('[Webhook] Stored procedure execution failed:', rpcError.message)
      return NextResponse.json({ error: rpcError.message }, { status: 500 })
    }

    console.log(`[Webhook] Payment successfully recorded for invoice ${invoice.id}`)
    return NextResponse.json({ success: true, message: 'Payment recorded successfully' }, { status: 200 })

  } catch (error: any) {
    console.error('[Webhook] Internal crash:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
