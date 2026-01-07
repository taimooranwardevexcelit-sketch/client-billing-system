import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: settings, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching settings:', error)
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }
    
    if (!settings) {
      // Create default settings if none exist
      const { data: defaultSettings, error: createError } = await supabase
        .from('settings')
        .insert([
          {
            default_rate_per_sq_ft: 100,
            company_name: 'My Billing Company',
            company_address: '',
            company_phone: '',
            tax_rate: 0
          }
        ])
        .select()
        .single()

      if (createError) {
        console.error('Error creating default settings:', createError)
        return NextResponse.json({ error: 'Failed to create default settings' }, { status: 500 })
      }

      return NextResponse.json(defaultSettings)
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    
    // Get existing settings
    const { data: existingSettings, error: fetchError } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .single()

    let settings

    if (fetchError && fetchError.code === 'PGRST116') {
      // No settings exist, create new
      const { data: newSettings, error: createError } = await supabase
        .from('settings')
        .insert([data])
        .select()
        .single()

      if (createError) {
        console.error('Error creating settings:', createError)
        return NextResponse.json({ error: 'Failed to create settings' }, { status: 500 })
      }

      settings = newSettings
    } else {
      if (fetchError) {
        console.error('Error fetching settings:', fetchError)
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
      }

      // Update existing settings
      const { data: updatedSettings, error: updateError } = await supabase
        .from('settings')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSettings!.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating settings:', updateError)
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
      }

      settings = updatedSettings
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
