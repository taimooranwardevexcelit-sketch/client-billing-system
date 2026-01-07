import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Rate types: CHINE and STAR
export type RateType = 'CHINE' | 'STAR'

export async function GET(request: NextRequest) {
  try {
    // Get user from cookies
    const userId = request.cookies.get('user_id')?.value
    const userRole = request.cookies.get('user_role')?.value

    if (!userId || !userRole) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: rates, error } = await supabase
      .from('rates')
      .select('*')
      .order('rate_type', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to fetch rates' }, { status: 500 })
    }

    return NextResponse.json({ rates: rates || [] })
  } catch (error) {
    console.error('Error fetching rates:', error)
    return NextResponse.json({ error: 'Failed to fetch rates' }, { status: 500 })
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

    // Only admins can manage rates
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can manage rates' }, { status: 403 })
    }

    const body = await request.json()
    const { rateType, ratePerSqMeter, description } = body

    if (!rateType || !ratePerSqMeter) {
      return NextResponse.json({ 
        error: 'Rate type and rate per square meter are required' 
      }, { status: 400 })
    }

    if (!['CHINE', 'STAR'].includes(rateType)) {
      return NextResponse.json({ 
        error: 'Rate type must be either CHINE or STAR' 
      }, { status: 400 })
    }

    // Check if rate type already exists
    const { data: existingRate } = await supabase
      .from('rates')
      .select('id')
      .eq('rate_type', rateType)
      .single()

    if (existingRate) {
      return NextResponse.json({ 
        error: `Rate for ${rateType} already exists. Use update instead.` 
      }, { status: 400 })
    }

    const { data: rate, error } = await supabase
      .from('rates')
      .insert([
        {
          rate_type: rateType,
          rate_per_sq_meter: parseFloat(ratePerSqMeter),
          description: description || null,
          created_by: userId
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to create rate' }, { status: 500 })
    }

    return NextResponse.json(rate, { status: 201 })
  } catch (error) {
    console.error('Error creating rate:', error)
    return NextResponse.json({ error: 'Failed to create rate' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get user from cookies
    const userId = request.cookies.get('user_id')?.value
    const userRole = request.cookies.get('user_role')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can manage rates
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can manage rates' }, { status: 403 })
    }

    const body = await request.json()
    const { id, ratePerSqMeter, description } = body

    if (!id || !ratePerSqMeter) {
      return NextResponse.json({ 
        error: 'Rate ID and rate per square meter are required' 
      }, { status: 400 })
    }

    const { data: rate, error } = await supabase
      .from('rates')
      .update({
        rate_per_sq_meter: parseFloat(ratePerSqMeter),
        description: description || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to update rate' }, { status: 500 })
    }

    return NextResponse.json(rate)
  } catch (error) {
    console.error('Error updating rate:', error)
    return NextResponse.json({ error: 'Failed to update rate' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get user from cookies
    const userId = request.cookies.get('user_id')?.value
    const userRole = request.cookies.get('user_role')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can manage rates
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can manage rates' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Rate ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('rates')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to delete rate' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting rate:', error)
    return NextResponse.json({ error: 'Failed to delete rate' }, { status: 500 })
  }
}
