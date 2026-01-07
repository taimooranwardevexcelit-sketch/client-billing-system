import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get user from cookies
    const userId = request.cookies.get('user_id')?.value
    const userRole = request.cookies.get('user_role')?.value

    if (!userId || !userRole) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Build query based on role
    let query = supabase
      .from('bills')
      .select(`
        *,
        client:clients (*),
        project:projects (*),
        payments (*)
      `)

    // If not admin, filter by assigned_to
    if (userRole !== 'ADMIN') {
      query = query.eq('assigned_to', userId)
    }

    const { data: bills, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to fetch bills' }, { status: 500 })
    }

    return NextResponse.json({ bills: bills || [] })
  } catch (error) {
    console.error('Error fetching bills:', error)
    return NextResponse.json({ error: 'Failed to fetch bills' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user from cookies
    const userId = request.cookies.get('user_id')?.value
    const userRole = request.cookies.get('user_role')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    // Assign to current user unless admin assigns to someone else
    const assigned_to = userRole === 'ADMIN' ? (body.assigned_to || userId) : userId

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
          project_id: projectId || null,
          assigned_to: assigned_to
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
