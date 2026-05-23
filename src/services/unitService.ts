import { createClient } from '@/utils/supabase/server'
import { OrganizationService } from './organizationService'

export class UnitService {
  /**
   * Create a unit associated with a property under the user's organization
   */
  static async createUnit(userId: string, propertyId: string, unitNumber: string, rentAmount: number) {
    const supabase = await createClient()

    // Get organization_id
    const profile = await OrganizationService.getLandlordProfile(userId)
    if (!profile) throw new Error('Landlord profile not found')

    const { data, error } = await supabase
      .from('units')
      .insert({
        organization_id: profile.organization_id,
        property_id: propertyId,
        unit_number: unitNumber,
        rent_amount: rentAmount,
        status: 'VACANT'
      })
      .select()
      .single()

    if (error) {
      console.error('[createUnit] Database error:', error.message)
      throw new Error(`Ku guuldareystay ku darista qolka: ${error.message}`)
    }

    return data
  }
}
