'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Payment {
  id: string
  amount: number
  paymentDate: string
  method: string
  notes?: string
}

interface Bill {
  id: string
  bill_number?: string
  billNumber?: string
  total_amount?: number
  totalAmount?: number
  paid_amount?: number
  paidAmount?: number
  outstanding_amount?: number
  outstandingAmount?: number
  status: string
  due_date?: string
  dueDate?: string
  paid_date?: string
  paidDate?: string
  payments: Payment[]
}

interface Project {
  id: string
  name: string
  area: number
  rate_per_sq_ft?: number
  ratePerSqFt?: number
  total_amount?: number
  totalAmount?: number
  bills?: Bill[]
}

interface Client {
  id: string
  name: string
  phone?: string
  address?: string
  projects: Project[]
  bills: Bill[]
}

interface Rate {
  id: string
  rate_type: string
  rate_per_sq_meter: number
  description?: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [rates, setRates] = useState<Rate[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'clients' | 'rates'>('clients')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [showRateModal, setShowRateModal] = useState(false)
  const [editingRate, setEditingRate] = useState<Rate | null>(null)

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    method: 'CASH',
    notes: '',
    paymentDate: new Date().toISOString().split('T')[0]
  })

  // Rate form state
  const [rateForm, setRateForm] = useState({
    rateType: 'CHINE',
    ratePerSqMeter: '',
    description: ''
  })

  useEffect(() => {
    fetchClients()
    fetchRates()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/client-overview')
      if (response.ok) {
        const data = await response.json()
        setClients(data.clients || [])
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRates = async () => {
    try {
      const response = await fetch('/api/rates')
      if (response.ok) {
        const data = await response.json()
        setRates(data.rates || [])
      }
    } catch (error) {
      console.error('Error fetching rates:', error)
    }
  }

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBill) return

    try {
      const response = await fetch('/api/payments-supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billId: selectedBill.id,
          ...paymentForm,
          amount: parseFloat(paymentForm.amount)
        })
      })

      if (response.ok) {
        setShowPaymentModal(false)
        setPaymentForm({
          amount: '',
          method: 'CASH',
          notes: '',
          paymentDate: new Date().toISOString().split('T')[0]
        })
        fetchClients() // Refresh data
        alert('Payment added successfully!')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error adding payment:', error)
      alert('Failed to add payment')
    }
  }

  const handleUpdateBillStatus = async (billId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/payments-supabase', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billId,
          status: newStatus
        })
      })

      if (response.ok) {
        fetchClients() // Refresh data
        alert('Bill status updated successfully!')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating bill status:', error)
      alert('Failed to update bill status')
    }
  }

  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const method = editingRate ? 'PUT' : 'POST'
      const body = editingRate 
        ? {
            id: editingRate.id,
            ratePerSqMeter: parseFloat(rateForm.ratePerSqMeter),
            description: rateForm.description
          }
        : {
            rateType: rateForm.rateType,
            ratePerSqMeter: parseFloat(rateForm.ratePerSqMeter),
            description: rateForm.description
          }

      const response = await fetch('/api/rates', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        setShowRateModal(false)
        setEditingRate(null)
        setRateForm({
          rateType: 'CHINE',
          ratePerSqMeter: '',
          description: ''
        })
        fetchRates()
        alert(editingRate ? 'Rate updated successfully!' : 'Rate added successfully!')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving rate:', error)
      alert('Failed to save rate')
    }
  }

  const handleDeleteRate = async (rateId: string) => {
    if (!confirm('Are you sure you want to delete this rate?')) return

    try {
      const response = await fetch(`/api/rates?id=${rateId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchRates()
        alert('Rate deleted successfully!')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting rate:', error)
      alert('Failed to delete rate')
    }
  }

  const openPaymentModal = (bill: Bill) => {
    setSelectedBill(bill)
    setPaymentForm({
      amount: (bill.outstanding_amount || bill.outstandingAmount || 0).toString(),
      method: 'CASH',
      notes: '',
      paymentDate: new Date().toISOString().split('T')[0]
    })
    setShowPaymentModal(true)
  }

  const openRateModal = (rate?: Rate) => {
    if (rate) {
      setEditingRate(rate)
      setRateForm({
        rateType: rate.rate_type,
        ratePerSqMeter: rate.rate_per_sq_meter.toString(),
        description: rate.description || ''
      })
    } else {
      setEditingRate(null)
      setRateForm({
        rateType: 'CHINE',
        ratePerSqMeter: '',
        description: ''
      })
    }
    setShowRateModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'PARTIAL': return 'bg-yellow-100 text-yellow-800'
      case 'PENDING': return 'bg-blue-100 text-blue-800'
      case 'OVERDUE': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('clients')}
              className={`${
                activeTab === 'clients'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Clients & Payments
            </button>
            <button
              onClick={() => setActiveTab('rates')}
              className={`${
                activeTab === 'rates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Rate Management
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'clients' ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Clients</div>
                <div className="mt-2 text-3xl font-bold text-gray-900">{clients.length}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Revenue</div>
                <div className="mt-2 text-3xl font-bold text-green-600">
                  ${clients.reduce((sum, client) => 
                    sum + client.bills.reduce((billSum, bill) => billSum + (bill.total_amount || 0), 0), 0
                  ).toFixed(2)}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Outstanding</div>
                <div className="mt-2 text-3xl font-bold text-red-600">
                  ${clients.reduce((sum, client) => 
                    sum + client.bills.reduce((billSum, bill) => billSum + (bill.outstanding_amount || 0), 0), 0
                  ).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Clients List */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">All Clients</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {clients.map((client) => (
                  <div key={client.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                        {client.phone && <p className="text-sm text-gray-600">Phone: {client.phone}</p>}
                        {client.address && <p className="text-sm text-gray-600">Address: {client.address}</p>}
                      </div>
                      <button
                        onClick={() => setSelectedClient(selectedClient?.id === client.id ? null : client)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        {selectedClient?.id === client.id ? 'Hide Details' : 'View Details'}
                      </button>
                    </div>

                    {selectedClient?.id === client.id && (
                      <div className="mt-4 space-y-4">
                        {/* Projects */}
                        {client.projects.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Projects</h4>
                            <div className="space-y-2">
                              {client.projects.map((project) => (
                                <div key={project.id} className="bg-gray-50 rounded-lg p-4">
                                  <div className="flex justify-between">
                                    <span className="font-medium text-gray-900">{project.name}</span>
                                    <span className="text-gray-700">${(project.total_amount || 0).toFixed(2)}</span>
                                  </div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    Area: {project.area} sq ft | Rate: ${project.rate_per_sq_ft}/sq ft
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Bills */}
                        {client.bills.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Bills & Payments</h4>
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill #</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outstanding</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {client.bills.map((bill) => (
                                    <tr key={bill.id}>
                                      <td className="px-4 py-3 text-sm text-gray-900">{bill.bill_number}</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">${(bill.total_amount || 0).toFixed(2)}</td>
                                      <td className="px-4 py-3 text-sm text-green-600 font-medium">${(bill.paid_amount || 0).toFixed(2)}</td>
                                      <td className="px-4 py-3 text-sm text-red-600 font-medium">${(bill.outstanding_amount || 0).toFixed(2)}</td>
                                      <td className="px-4 py-3 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bill.status)}`}>
                                          {bill.status}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 text-sm space-x-2">
                                        <button
                                          onClick={() => openPaymentModal(bill)}
                                          className="text-blue-600 hover:text-blue-800 font-medium"
                                          disabled={bill.status === 'PAID'}
                                        >
                                          Add Payment
                                        </button>
                                        {bill.status !== 'PAID' && (
                                          <select
                                            value={bill.status}
                                            onChange={(e) => handleUpdateBillStatus(bill.id, e.target.value)}
                                            className="text-sm border-gray-300 rounded px-2 py-1"
                                          >
                                            <option value="PENDING">Pending</option>
                                            <option value="PARTIAL">Partial</option>
                                            <option value="PAID">Paid</option>
                                            <option value="OVERDUE">Overdue</option>
                                          </select>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Payment History */}
                            {client.bills.some(bill => bill.payments.length > 0) && (
                              <div className="mt-4">
                                <h5 className="font-medium text-gray-900 mb-2">Payment History</h5>
                                {client.bills.map((bill) => 
                                  bill.payments.length > 0 && (
                                    <div key={bill.id} className="mb-3">
                                      <p className="text-sm font-medium text-gray-700 mb-1">Bill {bill.billNumber}:</p>
                                      <div className="space-y-1">
                                        {bill.payments.map((payment) => (
                                          <div key={payment.id} className="bg-gray-50 rounded p-2 text-sm flex justify-between">
                                            <span>
                                              ${payment.amount.toFixed(2)} - {payment.method}
                                              {payment.notes && ` (${payment.notes})`}
                                            </span>
                                            <span className="text-gray-600">
                                              {new Date(payment.paymentDate).toLocaleDateString()}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Rates Tab
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Rate Categories</h2>
                <button
                  onClick={() => openRateModal()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add New Rate
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {rates.map((rate) => (
                    <div key={rate.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{rate.rate_type}</h3>
                          {rate.description && (
                            <p className="text-sm text-gray-600 mt-1">{rate.description}</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openRateModal(rate)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRate(rate.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-blue-600">
                        ${rate.rate_per_sq_meter.toFixed(2)}
                        <span className="text-sm text-gray-500 font-normal ml-2">per sq meter</span>
                      </div>
                    </div>
                  ))}
                </div>
                {rates.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    No rates configured yet. Click "Add New Rate" to create one.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Add Payment</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddPayment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bill Number</label>
                <input
                  type="text"
                  value={selectedBill.bill_number || selectedBill.billNumber || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Outstanding Amount</label>
                <input
                  type="text"
                  value={`$${(selectedBill.outstanding_amount || selectedBill.outstandingAmount || 0).toFixed(2)}`}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="ONLINE">Online</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                <input
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Add Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rate Modal */}
      {showRateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingRate ? 'Edit Rate' : 'Add New Rate'}
              </h3>
              <button
                onClick={() => {
                  setShowRateModal(false)
                  setEditingRate(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSaveRate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rate Category *</label>
                <select
                  value={rateForm.rateType}
                  onChange={(e) => setRateForm({ ...rateForm, rateType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!!editingRate}
                  required
                >
                  <option value="CHINE">CHINE</option>
                  <option value="STAR">STAR</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rate per Square Meter *</label>
                <input
                  type="number"
                  step="0.01"
                  value={rateForm.ratePerSqMeter}
                  onChange={(e) => setRateForm({ ...rateForm, ratePerSqMeter: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={rateForm.description}
                  onChange={(e) => setRateForm({ ...rateForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Optional description for this rate category"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRateModal(false)
                    setEditingRate(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  {editingRate ? 'Update Rate' : 'Add Rate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
