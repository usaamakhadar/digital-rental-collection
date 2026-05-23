'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return redirect('/login?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/', 'layout')
  return redirect('/dashboard')
}

import { OrganizationService } from '@/services/organizationService'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const businessName = formData.get('businessName') as string
  const phone = formData.get('phone') as string

  // We sign up the user. Supabase will handle metadata.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        business_name: businessName,
        phone: phone,
      },
    },
  })

  if (error) {
    return redirect('/login?error=' + encodeURIComponent(error.message))
  }

  // Create organization and insert landlord record using OrganizationService
  if (data.user) {
    try {
      await OrganizationService.signupTenant(data.user.id, businessName, phone)
    } catch (err: any) {
      console.error('Failed to create organization or landlord profile:', err.message)
      return redirect('/login?error=' + encodeURIComponent(err.message))
    }
  }

  revalidatePath('/', 'layout')
  return redirect('/dashboard')
}

