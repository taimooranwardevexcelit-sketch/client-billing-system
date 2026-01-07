import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for TypeScript
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          full_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          full_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          full_name?: string
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          phone: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          length: number
          width: number
          area: number
          rate_per_sq_ft: number
          total_amount: number
          description: string | null
          created_at: string
          updated_at: string
          client_id: string
        }
        Insert: {
          id?: string
          name: string
          length: number
          width: number
          area: number
          rate_per_sq_ft: number
          total_amount: number
          description?: string | null
          created_at?: string
          updated_at?: string
          client_id: string
        }
        Update: {
          id?: string
          name?: string
          length?: number
          width?: number
          area?: number
          rate_per_sq_ft?: number
          total_amount?: number
          description?: string | null
          created_at?: string
          updated_at?: string
          client_id?: string
        }
      }
      bills: {
        Row: {
          id: string
          bill_number: string
          total_amount: number
          paid_amount: number
          outstanding_amount: number
          status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE'
          due_date: string | null
          paid_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
          client_id: string
          project_id: string | null
        }
        Insert: {
          id?: string
          bill_number: string
          total_amount: number
          paid_amount?: number
          outstanding_amount: number
          status?: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE'
          due_date?: string | null
          paid_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          client_id: string
          project_id?: string | null
        }
        Update: {
          id?: string
          bill_number?: string
          total_amount?: number
          paid_amount?: number
          outstanding_amount?: number
          status?: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE'
          due_date?: string | null
          paid_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          client_id?: string
          project_id?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          amount: number
          payment_date: string
          method: 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'ONLINE'
          notes: string | null
          created_at: string
          bill_id: string
        }
        Insert: {
          id?: string
          amount: number
          payment_date?: string
          method?: 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'ONLINE'
          notes?: string | null
          created_at?: string
          bill_id: string
        }
        Update: {
          id?: string
          amount?: number
          payment_date?: string
          method?: 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'ONLINE'
          notes?: string | null
          created_at?: string
          bill_id?: string
        }
      }
      rates: {
        Row: {
          id: string
          rate_type: 'CHINE' | 'STAR'
          rate_per_sq_meter: number
          description: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          rate_type: 'CHINE' | 'STAR'
          rate_per_sq_meter: number
          description?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          rate_type?: 'CHINE' | 'STAR'
          rate_per_sq_meter?: number
          description?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
