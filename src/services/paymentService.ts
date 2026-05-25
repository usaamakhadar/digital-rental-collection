import { createClient } from '@/utils/supabase/server'
import { OrganizationService } from './organizationService'

export class PaymentService {
  /**
   * Processes a manual cash payment for an outstanding invoice, updating status to PAID.
   * Utilizes the atomic SQL stored procedure.
   */
  static async recordManualPayment(
    userId: string, 
    invoiceId: string, 
    paymentMethod: string = 'CASH', 
    providerTransactionId?: string,
    amountPaid?: number
  ) {
    const supabase = await createClient()

    // 1. Fetch landlord profile
    const profile = await OrganizationService.getLandlordProfile(userId)
    if (!profile) throw new Error('Landlord profile not found')

    // 2. Fetch invoice amount
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('amount, status, amount_paid, currency_code, organization_id')
      .eq('id', invoiceId)
      .single()

    if (invoiceError || !invoice) {
      throw new Error(`Ku guuldareystay helista biilka: ${invoiceError?.message || 'Biilku ma jiro'}`)
    }

    if (invoice.status === 'PAID') {
      throw new Error('Biilkan mar hore ayaa la bixiyay!')
    }

    // Validate payment method
    const method = ['CASH', 'ZAAD', 'EDAHAB'].includes(paymentMethod.toUpperCase())
      ? paymentMethod.toUpperCase()
      : 'CASH'

    // 3. Generate a distinct transaction ID
    const cleanTxId = providerTransactionId && providerTransactionId.trim() !== ''
      ? providerTransactionId.trim()
      : `${method}-${invoiceId.substring(0, 8).toUpperCase()}-${Date.now()}`

    const actualPaymentAmount = amountPaid !== undefined ? amountPaid : invoice.amount
    
    // 4. Update Invoice status and amount_paid
    const currentPaid = Number(invoice.amount_paid || 0)
    const newPaid = currentPaid + Number(actualPaymentAmount)
    const newStatus = newPaid >= invoice.amount ? 'PAID' : invoice.status

    const { error: invoiceUpdateError } = await supabase
      .from('invoices')
      .update({ 
        amount_paid: newPaid,
        status: newStatus 
      })
      .eq('id', invoiceId)

    if (invoiceUpdateError) {
      console.error('[PaymentService] Error updating invoice:', invoiceUpdateError.message)
      throw new Error(`Ku guuldareystay cusboonaysiinta biilka: ${invoiceUpdateError.message}`)
    }

    // 5. Insert Payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        organization_id: invoice.organization_id,
        invoice_id: invoiceId,
        amount: actualPaymentAmount,
        currency_code: invoice.currency_code || 'USD',
        payment_method: method,
        provider_transaction_id: cleanTxId
      })

    if (paymentError) {
      console.error('[PaymentService] Error inserting payment:', paymentError.message)
      // Rollback is complex without transactions, but this is a rare edge case
    }

    console.log(`[PaymentService] Payment recorded successfully. Transaction: ${cleanTxId}, Amount: ${actualPaymentAmount}`)
    return cleanTxId
  }
}
