import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      length, 
      width, 
      area, 
      ratePerSqFt, 
      totalAmount, 
      description, 
      clientId 
    } = body

    if (!name || !length || !width || !ratePerSqFt || !clientId) {
      return NextResponse.json({ 
        error: 'Name, length, width, rate per sq ft, and client ID are required' 
      }, { status: 400 })
    }

    const project = await prisma.project.create({
      data: {
        name,
        length: parseFloat(length),
        width: parseFloat(width),
        area: parseFloat(area),
        ratePerSqFt: parseFloat(ratePerSqFt),
        totalAmount: parseFloat(totalAmount),
        description: description || null,
        clientId
      },
      include: {
        client: true,
        bills: {
          include: {
            payments: true
          }
        }
      }
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
