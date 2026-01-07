import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      billNumber,
      totalAmount, 
      outstandingAmount,
      dueDate,
      notes, 
      clientId,
      projectId 
    } = body

    if (!billNumber || !totalAmount || !clientId) {
      return NextResponse.json({ 
        error: 'Bill number, total amount, and client ID are required' 
      }, { status: 400 })
    }

    const bill = await prisma.bill.create({
      data: {
        billNumber,
        totalAmount: parseFloat(totalAmount),
        paidAmount: 0,
        outstandingAmount: parseFloat(outstandingAmount || totalAmount),
        status: 'PENDING',
        dueDate: dueDate ? new Date(dueDate) : null,
        notes: notes || null,
        clientId,
        projectId: projectId || null
      },
      include: {
        client: true,
        project: true,
        payments: true
      }
    })

    return NextResponse.json(bill, { status: 201 })
  } catch (error) {
    console.error('Error creating bill:', error)
    return NextResponse.json({ error: 'Failed to create bill' }, { status: 500 })
  }
}
