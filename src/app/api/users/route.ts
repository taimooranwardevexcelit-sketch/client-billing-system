import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Fetch all clients (users) - excluding password hashes for security
    const { data: clients, error } = await supabase
      .from('clients')
      .select('id, email, name, role, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    // Map 'name' to 'full_name' for frontend compatibility
    const users = clients?.map(client => ({
      ...client,
      full_name: client.name
    })) || []

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, full_name, role } = body

    if (!email || !password || !full_name) {
      return NextResponse.json({ 
        error: 'Email, password, and full name are required' 
      }, { status: 400 })
    }

    // Hash password
    const bcrypt = require('bcryptjs')
    const passwordHash = await bcrypt.hash(password, 10)

    const { data: client, error } = await supabase
      .from('clients')
      .insert([
        {
          email,
          password: passwordHash,
          name: full_name,
          role: role || 'CLIENT'
        }
      ])
      .select('id, email, name, role, created_at')
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    // Map 'name' to 'full_name' for frontend compatibility
    const user = {
      ...client,
      full_name: client.name
    }

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}

