import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// GET all payments
export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        bill: {
          include: {
            client: true,
            project: true
          }
        }
      },
      orderBy: {
        paymentDate: 'desc'
      }
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

// POST - Add a new payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { billId, amount, method, notes, paymentDate } = body

    if (!billId || !amount) {
      return NextResponse.json({ 
        error: 'Bill ID and amount are required' 
      }, { status: 400 })
    }

    // Get the bill
    const bill = await prisma.bill.findUnique({
      where: { id: billId },
      include: { payments: true }
    })

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 })
    }

    const paymentAmount = parseFloat(amount)
    const newPaidAmount = bill.paidAmount + paymentAmount
    const newOutstandingAmount = bill.totalAmount - newPaidAmount

    // Determine new status
    let newStatus = bill.status
    if (newOutstandingAmount <= 0) {
      newStatus = 'PAID'
    } else if (newPaidAmount > 0 && newOutstandingAmount > 0) {
      newStatus = 'PARTIAL'
    }

    // Create payment and update bill in a transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const payment = await tx.payment.create({
        data: {
          billId,
          amount: paymentAmount,
          method: method || 'CASH',
          notes: notes || null,
          paymentDate: paymentDate ? new Date(paymentDate) : new Date()
        }
      })

      const updatedBill = await tx.bill.update({
        where: { id: billId },
        data: {
          paidAmount: newPaidAmount,
          outstandingAmount: newOutstandingAmount,
          status: newStatus,
          paidDate: newStatus === 'PAID' ? new Date() : bill.paidDate
        },
        include: {
          payments: true,
          client: true,
          project: true
        }
      })

      return { payment, bill: updatedBill }
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}

// PUT - Update payment status or bill
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { billId, status, paidAmount } = body

    if (!billId) {
      return NextResponse.json({ error: 'Bill ID is required' }, { status: 400 })
    }

    const bill = await prisma.bill.findUnique({
      where: { id: billId }
    })

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 })
    }

    const updateData: any = {}
    
    if (status) {
      updateData.status = status
      if (status === 'PAID') {
        updateData.paidDate = new Date()
      }
    }

    if (paidAmount !== undefined) {
      const paid = parseFloat(paidAmount)
      updateData.paidAmount = paid
      updateData.outstandingAmount = bill.totalAmount - paid
      
      // Auto-update status based on payment
      if (paid >= bill.totalAmount) {
        updateData.status = 'PAID'
        updateData.paidDate = new Date()
      } else if (paid > 0) {
        updateData.status = 'PARTIAL'
      } else {
        updateData.status = 'PENDING'
      }
    }

    const updatedBill = await prisma.bill.update({
      where: { id: billId },
      data: updateData,
      include: {
        payments: true,
        client: true,
        project: true
      }
    })

    return NextResponse.json(updatedBill)
  } catch (error) {
    console.error('Error updating bill:', error)
    return NextResponse.json({ error: 'Failed to update bill' }, { status: 500 })
  }
}

