import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Get today's rate using the function
    const { data, error } = await supabase.rpc('get_todays_rate')

    if (error) {
      console.error('Error fetching rate:', error)
      return NextResponse.json({ rate: 100 }) // Default rate
    }

    return NextResponse.json({ rate: data || 100 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ rate: 100 })
  }
}


