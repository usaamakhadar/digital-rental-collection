import { createAdminClient } from '@/utils/supabase/admin'
import { notFound } from 'next/navigation'
import { Building2, AlertCircle, Receipt, CheckCircle2, Clock, Printer } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function TenantPortalPage({
  params,
  searchParams
}: {
  params: Promise<{ tenantId: string }>
  searchParams: Promise<{ phone?: string }>
}) {
  const { tenantId } = await params
  const { phone: providedHash } = await searchParams

  if (!tenantId || !providedHash) {
    return notFound()
  }

  const supabase = createAdminClient()

  // 1. Fetch Tenant details and their Organization (Landlord) details
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('*, organizations (name)')
    .eq('id', tenantId)
    .single()

  if (tenantError || !tenant) {
    return notFound()
  }

  // Fetch Landlord Phone
  const { data: landlordData } = await supabase
    .from('landlords')
    .select('phone')
    .eq('organization_id', tenant.organization_id)
    .single()
  
  const landlordPhone = landlordData?.phone

  // 2. Security Check: Verify Phone Hash
  const expectedHash = Buffer.from(tenant.phone).toString('base64')
  if (providedHash !== expectedHash) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-rose-100 text-center max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Aqoonsigaaga Waa La Diiday</h2>
          <p className="text-sm text-slate-500">
            Linkigan waa mid aan sax ahayn ama dhacay. Fadlan la xiriir mulkiilaha si uu kuugu soo diro linkigaaga rasmiga ah.
          </p>
        </div>
      </div>
    )
  }

  // 3. Fetch Invoices for this tenant
  const { data: rawInvoices, error: invoicesError } = await supabase
    .from('invoices')
    .select(`
      *,
      leases!inner (
        tenant_id,
        units (unit_number)
      )
    `)
    .eq('leases.tenant_id', tenantId)
    .order('due_date', { ascending: false })

  const invoices = rawInvoices || []
  
  // Format Currency Helper
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const pendingInvoices = invoices.filter(inv => inv.status === 'PENDING' || inv.status === 'OVERDUE')
  const paidInvoices = invoices.filter(inv => inv.status === 'PAID')

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans pb-12">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-6 py-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0066cc]">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-800 tracking-tight">
              {tenant.organizations?.name || 'Maamulka Guryaha'}
            </h1>
            <p className="text-xs text-slate-400 font-medium">Xariirka Kiraystaha (Tenant Portal)</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 mt-8 space-y-8">
        
        {/* Welcome Section */}
        <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-800 mb-1">
            Kusoo dhawaow, {tenant.name.split(' ')[0]} 👋
          </h2>
          <p className="text-sm text-slate-500">
            Halkan waxaad si toos ah ugala socon kartaa biilashaada kirada iyo rasiidhadooda adigoon cidna weydiin.
          </p>
        </section>

        {/* Unpaid Invoices Section */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-slate-800">Biilasha Kugu Maqan</h3>
          </div>
          
          {pendingInvoices.length === 0 ? (
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl text-center flex flex-col items-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-3" />
              <h4 className="text-sm font-bold text-emerald-800 mb-1">Wax Biil ah Kugu Ma Maqna!</h4>
              <p className="text-xs text-emerald-600 font-medium">Aad baad u mahadsantahay bixinta waqtiga ku habboon.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingInvoices.map(invoice => (
                <div key={invoice.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg uppercase tracking-wider ${
                        invoice.status === 'OVERDUE' ? 'bg-rose-50 text-rose-600 border border-rose-100 animate-pulse' : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {invoice.status === 'OVERDUE' ? 'Wuu Dhaafay Waqtigii' : 'Wali Lama Bixin'}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        {/* Accessing related data might require typing or mapping. We know leases exists. */}
                        Qolka: {invoice.unit_name_snapshot}
                      </span>
                    </div>
                    <h4 className="text-lg font-extrabold text-slate-800">
                      {formatCurrency(invoice.amount, invoice.currency_code)}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Ugu dambayn bixinta: <span className="font-bold text-slate-700">{new Date(invoice.due_date).toLocaleDateString('en-GB')}</span>
                    </p>
                  </div>
                  
                  <div className="flex items-center sm:items-start justify-end">
                     {landlordPhone ? (
                       <a 
                         href={`https://wa.me/${landlordPhone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(`Hello, waxaan rabaa inaan bixiyo biilka kirada oo dhan ${formatCurrency(invoice.amount, invoice.currency_code)} ee qolka ${invoice.unit_name_snapshot}.`)}`}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="w-full sm:w-auto px-4 py-2.5 bg-[#0066cc] hover:bg-[#0055b3] text-white rounded-xl text-sm font-bold shadow-sm transition-all text-center"
                       >
                         U Dir Lacagta (WhatsApp)
                       </a>
                     ) : (
                       <span className="text-xs text-slate-400">La xiriir Mulkiilaha</span>
                     )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Payment History / Receipts */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-slate-800">Taariikhda Bixinta & Rasiidhada</h3>
          </div>

          {paidInvoices.length === 0 ? (
            <p className="text-sm text-slate-500 px-2">Ma jiraan wax biilal ah oo aad hore u bixisay.</p>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              {paidInvoices.map((invoice, index) => (
                <div key={invoice.id} className={`p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${index !== paidInvoices.length - 1 ? 'border-b border-slate-100' : ''}`}>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      {formatCurrency(invoice.amount, invoice.currency_code)}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      La bixiyay: {new Date(invoice.created_at).toLocaleDateString('en-GB')} • Qolka: {invoice.unit_name_snapshot}
                    </p>
                  </div>
                  <Link 
                    href={`/portal/${tenantId}/receipt/${invoice.id}?phone=${providedHash}`}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-600 rounded-lg text-xs font-bold transition-colors w-full sm:w-auto justify-center"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Daabac Rasiidhka
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>

    </div>
  )
}
