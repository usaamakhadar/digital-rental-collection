import { createClient } from '@/utils/supabase/server'
import { OrganizationService } from './organizationService'

export class LeaseService {
  /**
   * Registers a new tenant, creates an active lease, updates unit status,
   * and automatically generates the first rent invoice.
   */
  static async createTenantAndLease(
    userId: string,
    tenantName: string,
    tenantPhone: string,
    emergencyName: string | null,
    emergencyPhone: string | null,
    unitId: string,
    startDate: string
  ) {
    const supabase = await createClient()

    // 1. Get profile and organization_id
    const profile = await OrganizationService.getLandlordProfile(userId)
    if (!profile) throw new Error('Landlord profile not found')
    const orgId = profile.organization_id

    // Normalize phone number (Format: e.g. 63XXXXXXX)
    const cleanPhone = tenantPhone.replace(/[\s\+]/g, '').replace(/^252|^00252|^0/, '')

    // 2. Safeguard: Check if the unit is vacant and retrieve unit details
    const { data: unit, error: unitFetchError } = await supabase
      .from('units')
      .select('status, rent_amount, unit_number')
      .eq('id', unitId)
      .single()

    if (unitFetchError || !unit) {
      throw new Error(`Ma helin xogta qolka: ${unitFetchError?.message || 'Qolku ma jiro'}`)
    }

    if (unit.status === 'OCCUPIED') {
      throw new Error('Qolkan mar hore ayaa la kireeyay! Fadlan dooro qol kale.')
    }

    let tenantId: string | null = null
    let leaseId: string | null = null

    try {
      // 3. Create Tenant
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          organization_id: orgId,
          name: tenantName,
          phone: cleanPhone,
          emergency_contact_name: emergencyName || null,
          emergency_contact_phone: emergencyPhone || null
        })
        .select()
        .single()

      if (tenantError || !tenant) {
        throw new Error(`Ku guuldareystay abuurista kiraystaha: ${tenantError?.message}`)
      }
      tenantId = tenant.id

      // 4. Create Lease
      const { data: lease, error: leaseError } = await supabase
        .from('leases')
        .insert({
          organization_id: orgId,
          tenant_id: tenantId,
          unit_id: unitId,
          start_date: startDate,
          status: 'ACTIVE'
        })
        .select()
        .single()

      if (leaseError || !lease) {
        throw new Error(`Ku guuldareystay abuurista heshiiska: ${leaseError?.message}`)
      }
      leaseId = lease.id

      // 5. Update Unit Status to OCCUPIED
      const { error: unitUpdateError } = await supabase
        .from('units')
        .update({ status: 'OCCUPIED' })
        .eq('id', unitId)

      if (unitUpdateError) {
        throw new Error(`Ku guuldareystay bedelida xaalada qolka: ${unitUpdateError.message}`)
      }

      // 6. Generate First Month Invoice with Snapshots
      const { error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          organization_id: orgId,
          lease_id: leaseId,
          amount: unit.rent_amount,
          currency_code: profile.organizations?.currency_code || 'USD',
          status: 'PENDING',
          due_date: startDate, // Due immediately on start date
          rent_amount_snapshot: unit.rent_amount,
          tenant_name_snapshot: tenantName,
          unit_name_snapshot: unit.unit_number
        })

      if (invoiceError) {
        throw new Error(`Heshiisku wuu guuleystay laakiin ku guuldareystay dhalista biilka koobaad: ${invoiceError.message}`)
      }

      console.log(`[LeaseService] Lease created successfully. Tenant ID: ${tenantId}, Lease ID: ${leaseId}`)
      return { tenantId, leaseId }

    } catch (err: any) {
      console.error('[LeaseService] Error in lease creation transaction. Rollbacking...', err.message)
      
      // Rollback attempts to keep DB clean on failure
      if (leaseId) {
        await supabase.from('leases').delete().eq('id', leaseId)
        await supabase.from('units').update({ status: 'VACANT' }).eq('id', unitId)
      }
      if (tenantId) {
        await supabase.from('tenants').delete().eq('id', tenantId)
      }

      throw err
    }
  }

  /**
   * Terminates a lease and marks the associated unit as vacant again.
   */
  static async terminateLease(userId: string, leaseId: string, unitId: string) {
    const supabase = await createClient()

    // 0. Safeguard: Check for unpaid invoices
    const { data: unpaidInvoices, error: checkError } = await supabase
      .from('invoices')
      .select('id')
      .eq('lease_id', leaseId)
      .in('status', ['PENDING', 'OVERDUE'])

    if (checkError) {
      throw new Error(`Ku guuldareystay xaqiijinta biilasha: ${checkError.message}`)
    }

    if (unpaidInvoices && unpaidInvoices.length > 0) {
      throw new Error('Ma joojin kartid heshiiskan maxaa yeelay kiraystaha waxaa ku maqan biilal aan la bixin! Fadlan marka hore bixi biilasha PENDING/OVERDUE ah.')
    }

    // 1. Terminate the lease
    const { error: leaseError } = await supabase
      .from('leases')
      .update({ status: 'TERMINATED' })
      .eq('id', leaseId)

    if (leaseError) {
      console.error('[LeaseService] Terminate lease error:', leaseError.message)
      throw new Error(`Ku guuldareystay joojinta kirada: ${leaseError.message}`)
    }

    // 2. Make the unit vacant again
    const { error: unitError } = await supabase
      .from('units')
      .update({ status: 'VACANT' })
      .eq('id', unitId)

    if (unitError) {
      console.error('[LeaseService] Terminate lease unit update error:', unitError.message)
      throw new Error(`Kiradii waa la joojiyay laakiin ku guuldareystay xoreynta qolka: ${unitError.message}`)
    }

    console.log(`[LeaseService] Terminated lease ${leaseId} for unit ${unitId}`)
  }
}
