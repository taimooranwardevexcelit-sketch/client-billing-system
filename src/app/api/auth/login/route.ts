import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Get user from database using RPC (only email parameter)
    const { data: users, error } = await supabase
      .rpc('authenticate_user', {
        user_email: email.toLowerCase()
      })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to authenticate' },
        { status: 500 }
      )
    }

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const user = users[0]
    
    // Fetch password hash separately (using email)
    const { data: passwordHash, error: passwordError } = await supabase
      .rpc('get_user_password', {
        user_email: email.toLowerCase()
      })
    
    if (passwordError || !passwordHash) {
      console.error('Failed to get user password:', passwordError)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await bcrypt.compare(password, passwordHash)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Return user data (map from RPC response)
    const userResponse = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role || 'CLIENT',
      created_at: user.created_at
    }

    // Set cookies for middleware
    const response = NextResponse.json({
      success: true,
      user: userResponse
    })
    
    response.cookies.set('user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })
    
    response.cookies.set('user_role', user.role || 'CLIENT', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
