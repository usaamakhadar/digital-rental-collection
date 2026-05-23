import { createClient } from '@/utils/supabase/server'
import { OrganizationService } from './organizationService'

export class InvoiceService {
  /**
   * Triggers the stored procedure to generate monthly invoices for all active leases
   * under the logged-in landlord's organization.
   */
  static async runMonthlyBilling(userId: string) {
    const supabase = await createClient()

    // 1. Get profile and organization_id
    const profile = await OrganizationService.getLandlordProfile(userId)
    if (!profile) throw new Error('Landlord profile not found')
    const orgId = profile.organization_id

    console.log(`[InvoiceService] Triggering monthly billing for organization: ${orgId}`)

    // 2. Call RPC stored procedure
    const { data: count, error } = await supabase.rpc('generate_monthly_invoices', {
      p_org_id: orgId
    })

    if (error) {
      console.error('[InvoiceService] Stored procedure error:', error.message)
      throw new Error(`Ku guuldareystay dhalista biilasha: ${error.message}`)
    }

    console.log(`[InvoiceService] Successfully generated ${count} monthly invoices.`)
    return count as number
  }
}
