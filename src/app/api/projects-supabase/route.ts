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
      .from('projects')
      .select(`
        *,
        client:clients (*),
        bills (
          *,
          payments (*)
        )
      `)

    // If not admin, filter by assigned_to
    if (userRole !== 'ADMIN') {
      query = query.eq('assigned_to', userId)
    }

    const { data: projects, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }

    return NextResponse.json({ projects: projects || [] })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
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

    // Assign to current user unless admin assigns to someone else
    const assigned_to = userRole === 'ADMIN' ? (body.assigned_to || userId) : userId

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
          client_id: clientId,
          assigned_to: assigned_to
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
