import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('clients')
      .select('count', { count: 'exact', head: true })

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: error.message,
        suggestions: [
          'Check your NEXT_PUBLIC_SUPABASE_URL in .env.local',
          'Check your NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local',
          'Ensure your Supabase project is running',
          'Verify that the clients table exists in your database'
        ]
      }, { status: 500 })
    }

    // Test table structure
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info', { table_name: 'clients' })
      .single()

    const response = {
      success: true,
      message: 'Supabase connection successful!',
      clientCount: data?.length || 0,
      timestamp: new Date().toISOString(),
      config: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '⚠️ Optional'
      }
    }

    return NextResponse.json(response)
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Connection test failed',
      details: error.message,
      suggestions: [
        'Make sure you have created a .env.local file',
        'Copy your Supabase credentials from the dashboard',
        'Restart your development server after adding environment variables',
        'Check the SUPABASE_SETUP.md file for detailed instructions'
      ]
    }, { status: 500 })
  }
}
