import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import DashboardClient from '@/components/DashboardClient'
import { OrganizationService } from '@/services/organizationService'

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Verify Authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Fetch Landlord Profile with nested Organization info
  let landlord = null
  const { data: landlordData } = await supabase
    .from('landlords')
    .select('*, organizations(*)')
    .eq('id', user.id)
    .maybeSingle()

  if (landlordData) {
    landlord = landlordData
  } else {
    // Automatically create landlord profile and organization for existing auth user
    try {
      const businessName = user.user_metadata?.business_name || 'My Properties'
      const phone = user.user_metadata?.phone || ''
      await OrganizationService.signupTenant(user.id, businessName, phone)
      
      // Fetch again
      const { data: refetched } = await supabase
        .from('landlords')
        .select('*, organizations(*)')
        .eq('id', user.id)
        .single()
      landlord = refetched
    } catch (err: any) {
      console.error('Failed to auto-onboard existing user:', err)
      redirect('/login?error=' + encodeURIComponent('Ku guuldareystay samaynta maamulaha: ' + err.message))
    }
  }


  // 3. Fetch Properties (scoped by RLS)
  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false })

  // 4. Fetch Units (scoped by RLS)
  const { data: units } = await supabase
    .from('units')
    .select('*')
    .order('unit_number', { ascending: true })

  // 5. Fetch Active Leases with nested Unit & Tenant details (scoped by RLS)
  const { data: leases } = await supabase
    .from('leases')
    .select(`
      id,
      unit_id,
      tenant_id,
      start_date,
      status,
      units (unit_number, rent_amount),
      tenants (*)
    `)
    .eq('status', 'ACTIVE')

  // 6. Fetch Invoices (scoped by RLS)
  const { data: invoices } = await supabase
    .from('invoices')
    .select(`
      *,
      leases (
        id,
        start_date,
        units (unit_number),
        tenants (name, phone)
      )
    `)
    .order('due_date', { ascending: false })

  // 7. Fetch Payments (scoped by RLS)
  const { data: payments } = await supabase
    .from('payments')
    .select('*, invoices(*)')
    .order('paid_at', { ascending: false })

  // 8. Fetch Expenses (scoped by RLS)
  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .order('expense_date', { ascending: false })

  return (
    <DashboardClient 
      user={user}
      landlord={landlord}
      properties={properties || []}
      units={units || []}
      leases={leases || []}
      invoices={invoices || []}
      payments={payments || []}
      expenses={expenses || []}
    />
  )
}
