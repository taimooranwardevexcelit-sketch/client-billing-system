import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Get all rate history
export async function GET() {
  try {
    const { data: rates, error } = await supabase
      .from('print_settings')
      .select('*')
      .order('effective_date', { ascending: false })

    if (error) {
      console.error('Error fetching rates:', error)
      return NextResponse.json({ error: 'Failed to fetch rates' }, { status: 500 })
    }

    return NextResponse.json({ rates: rates || [] })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update today's rate (Admin only)
export async function POST(request: NextRequest) {
  try {
    const userRole = request.cookies.get('user_role')?.value
    const userId = request.cookies.get('user_id')?.value

    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { rate, effectiveDate } = await request.json()

    if (!rate || rate <= 0) {
      return NextResponse.json({ error: 'Invalid rate' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('print_settings')
      .insert([
        {
          rate_per_sqm: parseFloat(rate),
          effective_date: effectiveDate || new Date().toISOString().split('T')[0],
          created_by: userId
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error updating rate:', error)
      return NextResponse.json({ error: 'Failed to update rate' }, { status: 500 })
    }

    return NextResponse.json({ success: true, rate: data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


