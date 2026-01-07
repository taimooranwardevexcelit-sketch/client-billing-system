import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding authentication data...')

  // Create Settings
  const settings = await prisma.settings.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      defaultRatePerSqFt: 150,
      companyName: 'Professional Billing Services',
      companyAddress: 'Lahore, Pakistan',
      companyPhone: '+92 300 1234567',
      taxRate: 0
    }
  })

  console.log('Settings created:', settings)

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10)
  const userPassword = await bcrypt.hash('user123', 10)

  // Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN'
    }
  })

  console.log('Admin user created:', { email: admin.email, role: admin.role })

  // Create a sample client
  const sampleClient = await prisma.client.upsert({
    where: { id: 'sample-client-1' },
    update: {},
    create: {
      id: 'sample-client-1',
      name: 'John Doe',
      phone: '+92 300 9876543',
      address: 'Karachi, Pakistan'
    }
  })

  console.log('Sample client created:', sampleClient.name)

  // Create Regular User linked to the client
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      name: 'John Doe',
      role: 'USER',
      clientId: sampleClient.id
    }
  })

  console.log('Regular user created:', { email: user.email, role: user.role, linkedClient: user.clientId })

  // Create sample projects for the client
  const project1 = await prisma.project.create({
    data: {
      name: 'Living Room Renovation',
      length: 15,
      width: 12,
      area: 180,
      ratePerSqFt: 150,
      totalAmount: 27000,
      description: 'Complete living room renovation with modern design',
      clientId: sampleClient.id
    }
  })

  const project2 = await prisma.project.create({
    data: {
      name: 'Kitchen Remodeling',
      length: 10,
      width: 10,
      area: 100,
      ratePerSqFt: 200,
      totalAmount: 20000,
      description: 'Full kitchen remodeling with new cabinets',
      clientId: sampleClient.id
    }
  })

  console.log('Sample projects created')

  // Create sample bills
  const bill1 = await prisma.bill.upsert({
    where: { billNumber: 'BILL-001' },
    update: {},
    create: {
      billNumber: 'BILL-001',
      totalAmount: 27000,
      paidAmount: 10000,
      outstandingAmount: 17000,
      status: 'PARTIAL',
      clientId: sampleClient.id,
      projectId: project1.id,
      notes: 'First installment received'
    }
  })

  const bill2 = await prisma.bill.upsert({
    where: { billNumber: 'BILL-002' },
    update: {},
    create: {
      billNumber: 'BILL-002',
      totalAmount: 20000,
      paidAmount: 0,
      outstandingAmount: 20000,
      status: 'PENDING',
      clientId: sampleClient.id,
      projectId: project2.id,
      notes: 'Pending payment'
    }
  })

  console.log('Sample bills created')

  console.log('\n✅ Seeding completed!')
  console.log('\n📝 Demo Credentials:')
  console.log('   Admin:')
  console.log('   Email: admin@example.com')
  console.log('   Password: admin123')
  console.log('\n   User:')
  console.log('   Email: user@example.com')
  console.log('   Password: user123')
  console.log('   (Linked to client: John Doe)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

