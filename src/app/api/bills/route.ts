import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      billNumber,
      totalAmount, 
      outstandingAmount,
      dueDate,
      notes, 
      clientId,
      projectId 
    } = body

    if (!billNumber || !totalAmount || !clientId) {
      return NextResponse.json({ 
        error: 'Bill number, total amount, and client ID are required' 
      }, { status: 400 })
    }

    const { data: bill, error } = await supabase
      .from('bills')
      .insert([
        {
          bill_number: billNumber,
          total_amount: parseFloat(totalAmount),
          paid_amount: 0,
          outstanding_amount: parseFloat(outstandingAmount || totalAmount),
          status: 'PENDING' as const,
          due_date: dueDate ? new Date(dueDate).toISOString() : null,
          notes: notes || null,
          client_id: clientId,
          project_id: projectId || null
        }
      ])
      .select(`
        *,
        client:clients (*),
        project:projects (*),
        payments (*)
      `)
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to create bill' }, { status: 500 })
    }

    return NextResponse.json(bill, { status: 201 })
  } catch (error) {
    console.error('Error creating bill:', error)
    return NextResponse.json({ error: 'Failed to create bill' }, { status: 500 })
  }
}
