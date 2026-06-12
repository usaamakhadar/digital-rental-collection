'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { PropertyService } from '@/services/propertyService'
import { UnitService } from '@/services/unitService'
import { LeaseService } from '@/services/leaseService'
import { InvoiceService } from '@/services/invoiceService'
import { PaymentService } from '@/services/paymentService'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

function createAdminClient() {
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

export async function createProperty(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const name = formData.get('name') as string
    const address = formData.get('address') as string

    await PropertyService.createProperty(user.id, name, address)
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function createUnit(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const propertyId = formData.get('propertyId') as string
    const unitNumber = formData.get('unitNumber') as string
    const rentAmount = parseFloat(formData.get('rentAmount') as string)

    await UnitService.createUnit(user.id, propertyId, unitNumber, rentAmount)
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function createTenantAndLease(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const emergencyContactName = formData.get('emergencyContactName') as string
    const emergencyContactPhone = formData.get('emergencyContactPhone') as string
    const unitId = formData.get('unitId') as string
    const startDate = formData.get('startDate') as string

    await LeaseService.createTenantAndLease(
      user.id,
      name,
      phone,
      emergencyContactName,
      emergencyContactPhone,
      unitId,
      startDate
    )

    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function terminateLease(leaseId: string, unitId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    await LeaseService.terminateLease(user.id, leaseId, unitId)
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function updateLandlordProfile(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const businessName = formData.get('businessName') as string
    const phone = formData.get('phone') as string
    const avatarUrl = formData.get('avatarUrl') as string

    const adminClient = createAdminClient()
    
    // 1. Update landlords profile
    const updateData: any = {
      business_name: businessName,
      phone: phone
    }

    // Only update avatar if provided
    if (avatarUrl) {
      updateData.avatar_url = avatarUrl
    }

    const { error: landlordError } = await adminClient
      .from('landlords')
      .update(updateData)
      .eq('id', user.id)

    if (landlordError) throw new Error(landlordError.message)

    // 2. Fetch the landlord profile to get organization_id, then update organization name
    const { data: landlordProfile } = await adminClient
      .from('landlords')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (landlordProfile?.organization_id) {
      const { error: orgError } = await adminClient
        .from('organizations')
        .update({
          name: businessName
        })
        .eq('id', landlordProfile.organization_id)

      if (orgError) console.error('Failed to update organization name:', orgError.message)
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

/**
 * Generate monthly invoices action
 */
export async function generateInvoicesAction() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const count = await InvoiceService.runMonthlyBilling(user.id)
    revalidatePath('/dashboard')
    return { success: true, count }
  } catch (err: any) {
    return { error: err.message }
  }
}

/**
 * Pay invoice manually action (cash)
 */
export async function payInvoiceManuallyAction(
  invoiceId: string, 
  paymentMethod: string = 'CASH', 
  providerTransactionId?: string,
  amountPaid?: number
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const txnId = await PaymentService.recordManualPayment(user.id, invoiceId, paymentMethod, providerTransactionId, amountPaid)
    revalidatePath('/dashboard')
    return { success: true, txnId }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function addExpenseAction(amount: number, category: string, description: string, expenseDate: string, currencyCode: string = 'USD') {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
      .from('expenses')
      .insert({
        landlord_id: user.id,
        amount: amount,
        currency_code: currencyCode,
        category: category,
        description: description,
        expense_date: expenseDate
      })

    if (error) return { error: error.message }
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function deleteExpenseAction(expenseId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId)
      .eq('landlord_id', user.id)

    if (error) throw new Error(error.message)
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}
