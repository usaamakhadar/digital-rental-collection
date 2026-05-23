import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Admin client bypasses RLS for signup operations
function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  )
}

export class OrganizationService {
  /**
   * Creates a new organization and registers a landlord linked to it.
   * Runs atomically using the admin client since signup is an unauthenticated/system-level action.
   */
  static async signupTenant(userId: string, businessName: string, phone: string) {
    const admin = getAdminClient()

    console.log(`[signupTenant] Creating organization for user ${userId}, business: ${businessName}`)

    // 1. Create Organization
    const { data: org, error: orgError } = await admin
      .from('organizations')
      .insert({
        name: businessName,
        currency_code: 'USD' // default currency
      })
      .select()
      .single()

    if (orgError) {
      console.error('[signupTenant] Organization creation failed:', orgError.message)
      throw new Error(`Ku guuldareystay samaynta shirkada: ${orgError.message}`)
    }

    // 2. Link landlord to organization
    const { error: landlordError } = await admin
      .from('landlords')
      .insert({
        id: userId,
        organization_id: org.id,
        business_name: businessName,
        phone: phone
      })

    if (landlordError) {
      console.error('[signupTenant] Landlord linking failed:', landlordError.message)
      // Attempt to clean up organization
      await admin.from('organizations').delete().eq('id', org.id)
      throw new Error(`Ku guuldareystay isku xidhka maamulaha: ${landlordError.message}`)
    }

    return org
  }

  /**
   * Fetch landlord and organization details by user ID
   */
  static async getLandlordProfile(userId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('landlords')
      .select(`
        *,
        organizations (*)
      `)
      .eq('id', userId)
      .single()

    if (error) {
      console.error(`[getLandlordProfile] Error fetching profile for ${userId}:`, error.message)
      return null
    }

    return data
  }
}
