import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET all payments
export async function GET() {
  try {
    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        *,
        bills:bill_id (
          *,
          clients:client_id (*)
        )
      `)
      .order('payment_date', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
    }

    return NextResponse.json(payments || [])
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

// POST - Add a new payment
export async function POST(request: NextRequest) {
  try {
    // Get user from cookies
    const userId = request.cookies.get('user_id')?.value
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { billId, amount, method, notes, paymentDate } = body

    if (!billId || !amount) {
      return NextResponse.json({ 
        error: 'Bill ID and amount are required' 
      }, { status: 400 })
    }

    // Get the bill
    const { data: bill, error: billError } = await supabase
      .from('bills')
      .select('*, payments(*)')
      .eq('id', billId)
      .single()

    if (billError || !bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 })
    }

    const paymentAmount = parseFloat(amount)
    const newPaidAmount = bill.paid_amount + paymentAmount
    const newOutstandingAmount = bill.total_amount - newPaidAmount

    // Determine new status
    let newStatus = bill.status
    if (newOutstandingAmount <= 0) {
      newStatus = 'PAID'
    } else if (newPaidAmount > 0 && newOutstandingAmount > 0) {
      newStatus = 'PARTIAL'
    }

    // Create payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        bill_id: billId,
        amount: paymentAmount,
        method: method || 'CASH',
        notes: notes || null,
        payment_date: paymentDate || new Date().toISOString()
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Payment creation error:', paymentError)
      return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
    }

    // Update bill
    const { data: updatedBill, error: updateError } = await supabase
      .from('bills')
      .update({
        paid_amount: newPaidAmount,
        outstanding_amount: newOutstandingAmount,
        status: newStatus,
        paid_date: newStatus === 'PAID' ? new Date().toISOString() : bill.paid_date,
        updated_at: new Date().toISOString()
      })
      .eq('id', billId)
      .select('*, clients(*), projects(*), payments(*)')
      .single()

    if (updateError) {
      console.error('Bill update error:', updateError)
      return NextResponse.json({ error: 'Failed to update bill' }, { status: 500 })
    }

    return NextResponse.json({ payment, bill: updatedBill }, { status: 201 })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}

// PUT - Update bill status
export async function PUT(request: NextRequest) {
  try {
    // Get user from cookies
    const userId = request.cookies.get('user_id')?.value
    const userRole = request.cookies.get('user_role')?.value
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can update bill status directly
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can update bill status' }, { status: 403 })
    }

    const body = await request.json()
    const { billId, status, paidAmount } = body

    if (!billId) {
      return NextResponse.json({ error: 'Bill ID is required' }, { status: 400 })
    }

    const { data: bill, error: billError } = await supabase
      .from('bills')
      .select('*')
      .eq('id', billId)
      .single()

    if (billError || !bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 })
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    }
    
    if (status) {
      updateData.status = status
      if (status === 'PAID') {
        updateData.paid_date = new Date().toISOString()
      }
    }

    if (paidAmount !== undefined) {
      const paid = parseFloat(paidAmount)
      updateData.paid_amount = paid
      updateData.outstanding_amount = bill.total_amount - paid
      
      // Auto-update status based on payment
      if (paid >= bill.total_amount) {
        updateData.status = 'PAID'
        updateData.paid_date = new Date().toISOString()
      } else if (paid > 0) {
        updateData.status = 'PARTIAL'
      } else {
        updateData.status = 'PENDING'
      }
    }

    const { data: updatedBill, error: updateError } = await supabase
      .from('bills')
      .update(updateData)
      .eq('id', billId)
      .select('*, clients(*), projects(*), payments(*)')
      .single()

    if (updateError) {
      console.error('Bill update error:', updateError)
      return NextResponse.json({ error: 'Failed to update bill' }, { status: 500 })
    }

    return NextResponse.json(updatedBill)
  } catch (error) {
    console.error('Error updating bill:', error)
    return NextResponse.json({ error: 'Failed to update bill' }, { status: 500 })
  }
}

