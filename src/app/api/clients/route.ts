import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: clients, error } = await supabase
      .from('clients')
      .select(`
        *,
        projects (
          *,
          bills (
            *,
            payments (*)
          )
        ),
        bills (
          *,
          project:projects (*),
          payments (*)
        )
      `)
      .order('name', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
    }

    return NextResponse.json(clients || [])
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, address } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const { data: client, error } = await supabase
      .from('clients')
      .insert([
        {
          name,
          phone: phone || null,
          address: address || null
        }
      ])
      .select(`
        *,
        projects (
          *,
          bills (
            *,
            payments (*)
          )
        ),
        bills (
          *,
          project:projects (*),
          payments (*)
        )
      `)
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
    }

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
  }
}
