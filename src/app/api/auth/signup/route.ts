import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json()

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      )
    }

    // Check if client already exists
    const { data: existingClients } = await supabase
      .from('clients')
      .select('id')
      .eq('email', email.toLowerCase())
      .limit(1)

    if (existingClients && existingClients.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    // Create new client (user)
    const { data: newClient, error } = await supabase
      .from('clients')
      .insert([
        {
          email: email.toLowerCase(),
          password: passwordHash,
          name: fullName,
          role: 'CLIENT'
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create user: ' + error.message },
        { status: 500 }
      )
    }

    // Return user data (without password hash)
    const { password: _, ...userWithoutPassword } = newClient
    
    // Map 'name' to 'full_name' for frontend compatibility
    const user = {
      ...userWithoutPassword,
      full_name: newClient.name
    }

    return NextResponse.json({
      success: true,
      user
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
