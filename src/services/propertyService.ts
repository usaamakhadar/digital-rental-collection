import { createClient } from '@/utils/supabase/server'
import { OrganizationService } from './organizationService'

export class PropertyService {
  /**
   * Create a new property under the user's organization
   */
  static async createProperty(userId: string, name: string, address: string) {
    const supabase = await createClient()
    
    // Get organization_id
    const profile = await OrganizationService.getLandlordProfile(userId)
    if (!profile) throw new Error('Landlord profile not found')
    
    const { data, error } = await supabase
      .from('properties')
      .insert({
        organization_id: profile.organization_id,
        name,
        address
      })
      .select()
      .single()

    if (error) {
      console.error('[createProperty] Database error:', error.message)
      throw new Error(`Ku guuldareystay ku darista guriga: ${error.message}`)
    }

    return data
  }
}
