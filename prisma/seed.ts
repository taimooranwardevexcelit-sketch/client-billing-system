import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create sample clients
  const mazhar = await prisma.client.create({
    data: {
      name: 'Mazhar',
      phone: '+92-300-1234567',
      address: 'House 123, Street 45, Lahore, Pakistan'
    }
  })

  const raju = await prisma.client.create({
    data: {
      name: 'Raju',
      phone: '+92-301-9876543',
      address: 'Flat 67, Block B, Karachi, Pakistan'
    }
  })

  const sabreen = await prisma.client.create({
    data: {
      name: 'Sabreen',
      phone: '+92-302-5555555',
      address: 'Villa 89, Phase 2, Islamabad, Pakistan'
    }
  })

  // Create sample projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Living Room Tiles',
      length: 10,
      width: 12,
      area: 120,
      ratePerSqFt: 25,
      totalAmount: 3000,
      description: 'Premium ceramic tiles for living room',
      clientId: mazhar.id
    }
  })

  const project2 = await prisma.project.create({
    data: {
      name: 'Kitchen Renovation',
      length: 8,
      width: 10,
      area: 80,
      ratePerSqFt: 35,
      totalAmount: 2800,
      description: 'Complete kitchen flooring with marble tiles',
      clientId: raju.id
    }
  })

  const project3 = await prisma.project.create({
    data: {
      name: 'Bathroom Tiles',
      length: 6,
      width: 8,
      area: 48,
      ratePerSqFt: 40,
      totalAmount: 1920,
      description: 'Waterproof tiles for master bathroom',
      clientId: sabreen.id
    }
  })

  // Create sample bills
  const bill1 = await prisma.bill.create({
    data: {
      billNumber: 'BILL-001',
      totalAmount: 3000,
      paidAmount: 1500,
      outstandingAmount: 1500,
      status: 'PARTIAL',
      dueDate: new Date('2026-02-15'),
      notes: 'First installment received',
      clientId: mazhar.id,
      projectId: project1.id
    }
  })

  const bill2 = await prisma.bill.create({
    data: {
      billNumber: 'BILL-002',
      totalAmount: 2800,
      paidAmount: 0,
      outstandingAmount: 2800,
      status: 'PENDING',
      dueDate: new Date('2026-01-30'),
      notes: 'Payment pending for kitchen renovation',
      clientId: raju.id,
      projectId: project2.id
    }
  })

  const bill3 = await prisma.bill.create({
    data: {
      billNumber: 'BILL-003',
      totalAmount: 1920,
      paidAmount: 1920,
      outstandingAmount: 0,
      status: 'PAID',
      paidDate: new Date('2026-01-01'),
      notes: 'Fully paid in advance',
      clientId: sabreen.id,
      projectId: project3.id
    }
  })

  // Create sample payments
  await prisma.payment.create({
    data: {
      amount: 1500,
      paymentDate: new Date('2025-12-15'),
      method: 'BANK_TRANSFER',
      notes: 'First installment payment',
      billId: bill1.id
    }
  })

  await prisma.payment.create({
    data: {
      amount: 1920,
      paymentDate: new Date('2026-01-01'),
      method: 'CASH',
      notes: 'Full payment in cash',
      billId: bill3.id
    }
  })

  console.log('Database seeded successfully!')
  console.log('Created clients:', { mazhar: mazhar.name, raju: raju.name, sabreen: sabreen.name })
  console.log('Created projects and bills with sample data')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
