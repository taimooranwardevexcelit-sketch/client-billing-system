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

    // Only admins can view all client overviews
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can view client overview' }, { status: 403 })
    }

    // Fetch all clients with their projects and bills
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select(`
        *,
        projects (
          id,
          name,
          area,
          rate_per_sq_ft,
          total_amount,
          description,
          created_at
        ),
        bills (
          id,
          bill_number,
          total_amount,
          paid_amount,
          outstanding_amount,
          status,
          due_date,
          created_at,
          payments (
            id,
            amount,
            payment_date,
            method
          )
        )
      `)
      .order('name', { ascending: true })

    if (clientsError) {
      console.error('Supabase error:', clientsError)
      return NextResponse.json({ error: 'Failed to fetch client overview' }, { status: 500 })
    }

    // Calculate summary for each client
    const clientsWithSummary = (clients || []).map((client: any) => {
      const projects = client.projects || []
      const bills = client.bills || []
      
      // Calculate totals from bills
      const totalAmount = bills.reduce((sum: number, bill: any) => 
        sum + parseFloat(bill.total_amount || 0), 0)
      const paidAmount = bills.reduce((sum: number, bill: any) => 
        sum + parseFloat(bill.paid_amount || 0), 0)
      const outstandingAmount = bills.reduce((sum: number, bill: any) => 
        sum + parseFloat(bill.outstanding_amount || 0), 0)
      
      // Calculate total area from projects
      const totalArea = projects.reduce((sum: number, project: any) => 
        sum + parseFloat(project.area || 0), 0)

      // Count bills by status
      const billsByStatus = {
        pending: bills.filter((b: any) => b.status === 'PENDING').length,
        partial: bills.filter((b: any) => b.status === 'PARTIAL').length,
        paid: bills.filter((b: any) => b.status === 'PAID').length,
        overdue: bills.filter((b: any) => b.status === 'OVERDUE').length
      }

      return {
        ...client,
        summary: {
          totalProjects: projects.length,
          totalBills: bills.length,
          totalArea,
          totalAmount,
          paidAmount,
          outstandingAmount,
          paymentPercentage: totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0,
          billsByStatus
        }
      }
    })

    // Calculate overall totals
    const overallTotals = clientsWithSummary.reduce((acc: any, client: any) => ({
      totalClients: acc.totalClients + 1,
      totalProjects: acc.totalProjects + client.summary.totalProjects,
      totalBills: acc.totalBills + client.summary.totalBills,
      totalArea: acc.totalArea + client.summary.totalArea,
      totalAmount: acc.totalAmount + client.summary.totalAmount,
      totalPaid: acc.totalPaid + client.summary.paidAmount,
      totalOutstanding: acc.totalOutstanding + client.summary.outstandingAmount
    }), {
      totalClients: 0,
      totalProjects: 0,
      totalBills: 0,
      totalArea: 0,
      totalAmount: 0,
      totalPaid: 0,
      totalOutstanding: 0
    })

    return NextResponse.json({ 
      clients: clientsWithSummary,
      totals: overallTotals
    })
  } catch (error) {
    console.error('Error fetching client overview:', error)
    return NextResponse.json({ error: 'Failed to fetch client overview' }, { status: 500 })
  }
}
