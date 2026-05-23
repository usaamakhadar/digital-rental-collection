import { createAdminClient } from '@/utils/supabase/admin'
import { notFound } from 'next/navigation'
import { Building2, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import PrintButton from '@/components/PrintButton'

export const dynamic = 'force-dynamic'

export default async function ReceiptPage({
  params,
  searchParams
}: {
  params: Promise<{ tenantId: string, invoiceId: string }>
  searchParams: Promise<{ phone?: string }>
}) {
  const { tenantId, invoiceId } = await params
  const { phone: providedHash } = await searchParams

  if (!tenantId || !invoiceId || !providedHash) {
    return notFound()
  }

  const supabase = createAdminClient()

  // 1. Fetch Tenant
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('*, organizations (name)')
    .eq('id', tenantId)
    .single()

  if (tenantError || !tenant) {
    return notFound()
  }

  // 2. Verify Phone Hash
  const expectedHash = Buffer.from(tenant.phone).toString('base64')
  if (providedHash !== expectedHash) {
    return notFound()
  }

  // 3. Fetch Invoice and Payment
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select(`
      *,
      leases!inner (
        tenant_id,
        units (unit_number)
      ),
      payments (*)
    `)
    .eq('id', invoiceId)
    .eq('leases.tenant_id', tenantId)
    .single()

  if (invoiceError || !invoice) {
    return notFound()
  }

  const payment = invoice.payments?.[0]
  const isPaid = invoice.status === 'PAID'
  const isPartial = invoice.amount_paid > 0 && invoice.amount_paid < invoice.amount
  
  if (!isPaid && !isPartial) {
    // Only allow viewing receipts for paid or partially paid invoices
    return notFound()
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] print:bg-white text-slate-800 font-sans p-4 sm:p-8 flex flex-col items-center">
      
      {/* Top Actions (Hidden on Print) */}
      <div className="w-full max-w-3xl flex flex-col sm:flex-row justify-between items-center mb-8 print:hidden gap-4">
        <Link 
          href={`/portal/${tenantId}?phone=${providedHash}`}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-semibold self-start sm:self-auto"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Ku Noqo Portal-ka</span>
        </Link>
        <PrintButton />
      </div>

      {/* A4 Receipt Document */}
      <div className="w-full max-w-3xl bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-slate-100 print:shadow-none print:border-none print:p-0">
        
        {/* Receipt Header */}
        <div className="flex justify-between items-start mb-12 border-b border-slate-100 pb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-[#0066cc]">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {tenant.organizations?.name || 'Maamulka Guryaha'}
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">Rasiidhka Bixinta Kirada (Official Receipt)</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-black text-emerald-500 mb-2">RECEIPT</h2>
            <p className="text-sm text-slate-500 font-bold">#{invoice.id.substring(0, 8).toUpperCase()}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-8 mb-12">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Laga Qabtay (Received From)</h3>
            <p className="text-lg font-extrabold text-slate-800">{tenant.name}</p>
            <p className="text-sm text-slate-500">{tenant.phone}</p>
          </div>
          <div className="text-right">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Taariikhda Bixinta (Date Paid)</h3>
            <p className="text-lg font-extrabold text-slate-800">
              {payment ? new Date(payment.paid_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              }) : 'N/A'}
            </p>
          </div>
        </div>

        {/* Payment Details Table */}
        <div className="bg-slate-50 rounded-2xl p-6 mb-12 border border-slate-100">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Faahfaahin (Description)</th>
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Cadadka (Amount)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-4 text-slate-700 font-semibold">
                  Kirada Qolka {invoice.leases.units.unit_number} (Bisha {new Date(invoice.due_date).toLocaleString('so-SO', { month: 'long' })})
                </td>
                <td className="py-4 text-right text-slate-800 font-extrabold">
                  {formatCurrency(invoice.amount, invoice.currency_code)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary & Stamp */}
        <div className="flex justify-between items-end border-t border-slate-100 pt-8 mt-auto">
          <div>
            <p className="text-xs text-slate-400 font-bold mb-1">Habka Bixinta (Payment Method):</p>
            <p className="text-sm text-slate-800 font-bold">{payment?.payment_method || 'CASH'}</p>
            {payment?.provider_transaction_id && (
              <p className="text-xs text-slate-500 mt-0.5">Tixraac: {payment.provider_transaction_id}</p>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right mr-4">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                {isPartial ? 'Wadarta La Bixiyay' : 'Wadarta Bixinta'}
              </p>
              <p className="text-3xl font-black text-[#0066cc]">
                {formatCurrency(isPartial ? invoice.amount_paid : invoice.amount, invoice.currency_code)}
              </p>
              {isPartial && (
                <p className="text-xs text-rose-500 font-bold mt-1 uppercase tracking-wider">
                  Haraadi: {formatCurrency(invoice.amount - invoice.amount_paid, invoice.currency_code)}
                </p>
              )}
            </div>
            <div className={`w-24 h-24 border-4 rounded-full flex flex-col items-center justify-center opacity-80 transform -rotate-12 ${isPartial ? 'border-blue-500 text-blue-500' : 'border-emerald-500 text-emerald-500'}`}>
              <CheckCircle2 className={`w-8 h-8 mb-1 ${isPartial ? 'text-blue-500' : 'text-emerald-500'}`} />
              <span className={`text-xs font-black uppercase tracking-widest ${isPartial ? 'text-blue-500' : 'text-emerald-500'}`}>
                {isPartial ? 'PARTIAL' : 'PAID'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center print:mt-32">
          <p className="text-xs text-slate-400">
            Waad ku mahadsan tahay in aad nala macaamilto! Haddii aad qabtid wax su'aal ah, fadlan la xiriir {tenant.organizations?.phone || 'Maamulka'}.
          </p>
          <p className="text-[10px] text-slate-300 mt-2">Generated by PropManage (Digital Rental Collection)</p>
        </div>
      </div>
    </div>
  )
}
