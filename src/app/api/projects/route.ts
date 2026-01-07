import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      length, 
      width, 
      area, 
      ratePerSqFt, 
      totalAmount, 
      description, 
      clientId 
    } = body

    if (!name || !length || !width || !ratePerSqFt || !clientId) {
      return NextResponse.json({ 
        error: 'Name, length, width, rate per sq ft, and client ID are required' 
      }, { status: 400 })
    }

    const { data: project, error } = await supabase
      .from('projects')
      .insert([
        {
          name,
          length: parseFloat(length),
          width: parseFloat(width),
          area: parseFloat(area),
          rate_per_sq_ft: parseFloat(ratePerSqFt),
          total_amount: parseFloat(totalAmount),
          description: description || null,
          client_id: clientId
        }
      ])
      .select(`
        *,
        client:clients (*),
        bills (
          *,
          payments (*)
        )
      `)
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
