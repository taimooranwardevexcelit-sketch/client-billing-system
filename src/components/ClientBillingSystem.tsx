'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Calculator, DollarSign, User, FileText } from 'lucide-react'

interface Client {
  id: string
  name: string
  phone?: string
  address?: string
  createdAt: string
  updatedAt: string
  projects: Project[]
  bills: Bill[]
}

interface Project {
  id: string
  name: string
  length: number
  width: number
  area: number
  ratePerSqFt: number
  totalAmount: number
  description?: string
  createdAt: string
  updatedAt: string
  clientId: string
  bills: Bill[]
}

interface Bill {
  id: string
  billNumber: string
  totalAmount: number
  paidAmount: number
  outstandingAmount: number
  status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE'
  dueDate?: string
  paidDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
  clientId: string
  projectId?: string
  project?: Project
  payments: Payment[]
}

interface Payment {
  id: string
  amount: number
  paymentDate: string
  method: 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'ONLINE'
  notes?: string
  createdAt: string
  billId: string
}

export default function ClientBillingSystem() {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'clients' | 'projects' | 'bills'>('clients')
  const [showAddClient, setShowAddClient] = useState(false)
  const [showAddProject, setShowAddProject] = useState(false)
  const [showAddBill, setShowAddBill] = useState(false)
  const [showInvoice, setShowInvoice] = useState(false)
  const [invoiceType, setInvoiceType] = useState<'client' | 'project'>('client')
  const [selectedProjectForInvoice, setSelectedProjectForInvoice] = useState<Project | null>(null)

  // Form states
  const [newClient, setNewClient] = useState({ name: '', phone: '', address: '' })
  const [newProject, setNewProject] = useState({
    name: '',
    length: '',
    width: '',
    ratePerSqFt: '',
    description: ''
  })
  const [newBill, setNewBill] = useState({
    totalAmount: '',
    dueDate: '',
    notes: '',
    projectId: ''
  })

  // Load clients on component mount
  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const calculateArea = (length: string, width: string) => {
    const l = parseFloat(length) || 0
    const w = parseFloat(width) || 0
    return l * w
  }

  const calculateTotal = (area: number, rate: string) => {
    const r = parseFloat(rate) || 0
    return area * r
  }

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      })
      if (response.ok) {
        setNewClient({ name: '', phone: '', address: '' })
        setShowAddClient(false)
        fetchClients()
      }
    } catch (error) {
      console.error('Error adding client:', error)
    }
  }

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClient) return

    const area = calculateArea(newProject.length, newProject.width)
    const totalAmount = calculateTotal(area, newProject.ratePerSqFt)

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProject,
          length: parseFloat(newProject.length),
          width: parseFloat(newProject.width),
          area,
          ratePerSqFt: parseFloat(newProject.ratePerSqFt),
          totalAmount,
          clientId: selectedClient.id
        })
      })
      if (response.ok) {
        setNewProject({ name: '', length: '', width: '', ratePerSqFt: '', description: '' })
        setShowAddProject(false)
        fetchClients()
      }
    } catch (error) {
      console.error('Error adding project:', error)
    }
  }

  const handleAddBill = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClient) return

    try {
      const response = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newBill,
          totalAmount: parseFloat(newBill.totalAmount),
          outstandingAmount: parseFloat(newBill.totalAmount),
          clientId: selectedClient.id,
          projectId: newBill.projectId || null,
          billNumber: `BILL-${Date.now()}`
        })
      })
      if (response.ok) {
        setNewBill({ totalAmount: '', dueDate: '', notes: '', projectId: '' })
        setShowAddBill(false)
        fetchClients()
      }
    } catch (error) {
      console.error('Error adding bill:', error)
    }
  }

  const getTotalOutstanding = (client: Client) => {
    return client.bills.reduce((sum, bill) => sum + bill.outstandingAmount, 0)
  }

  const getTotalAmount = (client: Client) => {
    return client.bills.reduce((sum, bill) => sum + bill.totalAmount, 0)
  }

  const getTotalPaid = (client: Client) => {
    return client.bills.reduce((sum, bill) => sum + bill.paidAmount, 0)
  }

  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const openClientInvoice = () => {
    setInvoiceType('client')
    setSelectedProjectForInvoice(null)
    setShowInvoice(true)
  }

  const openProjectInvoice = (project: Project) => {
    setInvoiceType('project')
    setSelectedProjectForInvoice(project)
    setShowInvoice(true)
  }

  const printInvoice = () => {
    window.print()
  }

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-purple-100 overflow-hidden animate-slideInUp">
        {/* Header */}
        <div className="border-b border-gradient-to-r from-purple-200 to-blue-200 p-8 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50">
          <h1 className="text-4xl font-bold gradient-text mb-6 animate-fadeIn">Client Billing System</h1>
          
          {/* Search Bar */}
          <div className="relative mb-6 animate-slideInLeft">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search clients by name..."
              className="w-full pl-12 pr-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all duration-300 bg-white/80 backdrop-blur-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Add Client Button */}
          <button
            onClick={() => setShowAddClient(true)}
            className="btn-glow bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 flex items-center gap-2 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-slideInRight"
          >
            <Plus className="w-5 h-5" />
            Add New Client
          </button>
        </div>

        <div className="flex">
          {/* Clients List */}
          <div className="w-1/3 border-r border-purple-100 bg-gradient-to-b from-purple-50/30 to-white/30">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <User className="w-6 h-6 text-purple-600" />
                Clients
              </h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {filteredClients.map((client, index) => (
                  <div
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-102 animate-slideInLeft ${
                      selectedClient?.id === client.id
                        ? 'bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-400 shadow-lg'
                        : 'bg-white/80 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 border-2 border-transparent hover:border-purple-200 shadow-sm hover:shadow-md'
                    }`}
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-full ${selectedClient?.id === client.id ? 'bg-purple-600' : 'bg-purple-400'}`}>
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-semibold text-gray-800">{client.name}</span>
                    </div>
                    {client.phone && (
                      <p className="text-sm text-gray-600 ml-11">{client.phone}</p>
                    )}
                    <div className="flex items-center gap-2 mt-3 ml-11">
                      <DollarSign className="w-4 h-4 text-red-500 animate-pulse" />
                      <span className="text-sm font-bold text-red-600">
                        Outstanding: {formatCurrency(getTotalOutstanding(client))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Client Details */}
          <div className="flex-1 bg-gradient-to-br from-white to-purple-50/20">
            {selectedClient ? (
              <div className="p-8 animate-fadeIn">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold gradient-text">{selectedClient.name}</h2>
                  <div className="flex gap-3">
                    <button
                      onClick={openClientInvoice}
                      className="btn-glow bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-indigo-600 flex items-center gap-2 shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      <FileText className="w-4 h-4" />
                      Generate Invoice
                    </button>
                    <button
                      onClick={() => setShowAddProject(true)}
                      className="btn-glow bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-teal-600 flex items-center gap-2 shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      <Plus className="w-4 h-4" />
                      Add Project
                    </button>
                    <button
                      onClick={() => setShowAddBill(true)}
                      className="btn-glow bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-xl hover:from-orange-600 hover:to-pink-600 flex items-center gap-2 shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      <Plus className="w-4 h-4" />
                      Add Bill
                    </button>
                  </div>
                </div>

                {/* Client Info */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-2xl mb-8 border-2 border-purple-100 shadow-sm animate-slideInUp">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-bold text-purple-700 uppercase tracking-wide">Phone</label>
                      <p className="text-gray-900 text-lg mt-1">{selectedClient.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-purple-700 uppercase tracking-wide">Address</label>
                      <p className="text-gray-900 text-lg mt-1">{selectedClient.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b-2 border-purple-100 mb-6">
                  <nav className="-mb-0.5 flex space-x-8">
                    {['projects', 'bills'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab as 'projects' | 'bills')}
                        className={`py-3 px-4 border-b-4 font-bold text-base transition-all duration-300 transform hover:scale-105 ${
                          activeTab === tab
                            ? 'border-purple-600 text-purple-700 bg-purple-50 rounded-t-lg'
                            : 'border-transparent text-gray-500 hover:text-purple-600 hover:border-purple-300'
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Projects Tab */}
                {activeTab === 'projects' && (
                  <div className="space-y-4 animate-fadeIn">
                    {selectedClient.projects.map((project, index) => (
                      <div key={project.id} className="border-2 border-blue-200 rounded-2xl p-6 bg-gradient-to-br from-white to-blue-50 hover:shadow-lg hover:border-blue-400 transition-all duration-300 transform hover:-translate-y-1 animate-slideInUp" style={{animationDelay: `${index * 0.1}s`}}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-full animate-bounce-slow">
                              <Calculator className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-bold text-xl text-gray-800">{project.name}</h3>
                          </div>
                          <button
                            onClick={() => openProjectInvoice(project)}
                            className="btn-glow bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-600 flex items-center gap-2 text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                          >
                            <FileText className="w-3 h-3" />
                            Invoice
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/70 p-3 rounded-lg">
                            <span className="text-gray-600 font-semibold block mb-1">Dimensions:</span>
                            <span className="text-blue-700 font-bold text-lg">{project.length} × {project.width} ft</span>
                          </div>
                          <div className="bg-white/70 p-3 rounded-lg">
                            <span className="text-gray-600 font-semibold block mb-1">Area:</span>
                            <span className="text-blue-700 font-bold text-lg">{project.area} sq ft</span>
                          </div>
                          <div className="bg-white/70 p-3 rounded-lg">
                            <span className="text-gray-600 font-semibold block mb-1">Rate per sq ft:</span>
                            <span className="text-green-700 font-bold text-lg">{formatCurrency(project.ratePerSqFt)}</span>
                          </div>
                          <div className="bg-gradient-to-r from-green-100 to-teal-100 p-3 rounded-lg border-2 border-green-300">
                            <span className="text-gray-700 font-semibold block mb-1">Total Amount:</span>
                            <span className="text-green-700 font-bold text-xl">{formatCurrency(project.totalAmount)}</span>
                          </div>
                        </div>
                        {project.description && (
                          <p className="text-sm text-gray-700 mt-4 p-3 bg-blue-50 rounded-lg italic">{project.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Bills Tab */}
                {activeTab === 'bills' && (
                  <div className="space-y-4 animate-fadeIn">
                    {selectedClient.bills.map((bill, index) => (
                      <div key={bill.id} className="border-2 border-orange-200 rounded-2xl p-6 bg-gradient-to-br from-white to-orange-50 hover:shadow-lg hover:border-orange-400 transition-all duration-300 transform hover:-translate-y-1 animate-slideInUp" style={{animationDelay: `${index * 0.1}s`}}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500 rounded-full animate-pulse-slow">
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-bold text-xl text-gray-800">{bill.billNumber}</h3>
                          </div>
                          <span className={`px-4 py-2 rounded-xl text-sm font-bold shadow-md animate-pulse-slow ${
                            bill.status === 'PAID' ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' :
                            bill.status === 'PARTIAL' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
                            bill.status === 'OVERDUE' ? 'bg-gradient-to-r from-red-400 to-red-600 text-white' :
                            'bg-gradient-to-r from-gray-400 to-gray-600 text-white'
                          }`}>
                            {bill.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="bg-white/70 p-4 rounded-lg">
                            <span className="text-gray-600 font-semibold block mb-1 text-sm">Total Amount:</span>
                            <span className="text-blue-700 font-bold text-lg">{formatCurrency(bill.totalAmount)}</span>
                          </div>
                          <div className="bg-white/70 p-4 rounded-lg">
                            <span className="text-gray-600 font-semibold block mb-1 text-sm">Paid Amount:</span>
                            <span className="text-green-700 font-bold text-lg">{formatCurrency(bill.paidAmount)}</span>
                          </div>
                          <div className="bg-gradient-to-r from-red-100 to-pink-100 p-4 rounded-lg border-2 border-red-300">
                            <span className="text-gray-700 font-semibold block mb-1 text-sm">Outstanding:</span>
                            <span className="text-red-700 font-bold text-lg">{formatCurrency(bill.outstandingAmount)}</span>
                          </div>
                        </div>
                        {bill.project && (
                          <p className="text-sm text-gray-700 mt-2 p-3 bg-blue-50 rounded-lg">
                            <span className="font-semibold">Project:</span> {bill.project.name}
                          </p>
                        )}
                        {bill.notes && (
                          <p className="text-sm text-gray-700 mt-2 p-3 bg-orange-50 rounded-lg italic">
                            <span className="font-semibold">Notes:</span> {bill.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 text-gray-500 animate-fadeIn">
                <div className="text-center">
                  <div className="animate-float mb-6">
                    <User className="w-20 h-20 mx-auto text-purple-300" />
                  </div>
                  <p className="text-xl text-gray-600 font-medium">Select a client to view details</p>
                  <p className="text-sm text-gray-400 mt-2">Choose a client from the list to see their projects and bills</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddClient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl transform animate-slideInUp border-2 border-purple-200">
            <h2 className="text-3xl font-bold mb-6 gradient-text flex items-center gap-3">
              <User className="w-8 h-8" />
              Add New Client
            </h2>
            <form onSubmit={handleAddClient}>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all duration-300"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Phone</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all duration-300"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Address</label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all duration-300"
                    rows={3}
                    value={newClient.address}
                    onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button
                  type="submit"
                  className="btn-glow flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  Add Client
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddClient(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddProject && selectedClient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl transform animate-slideInUp border-2 border-green-200 max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-bold mb-2 gradient-text flex items-center gap-3">
              <Calculator className="w-8 h-8" />
              Add New Project
            </h2>
            <p className="text-gray-600 mb-6">for {selectedClient.name}</p>
            <form onSubmit={handleAddProject}>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Project Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-400 transition-all duration-300"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Length (ft) *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-400 transition-all duration-300"
                      value={newProject.length}
                      onChange={(e) => setNewProject({ ...newProject, length: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Width (ft) *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-400 transition-all duration-300"
                      value={newProject.width}
                      onChange={(e) => setNewProject({ ...newProject, width: e.target.value })}
                    />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-teal-50 p-4 rounded-xl border-2 border-blue-200">
                  <label className="block text-sm font-bold text-blue-700 mb-1 uppercase tracking-wide">Calculated Area</label>
                  <p className="text-2xl font-bold text-blue-800">{calculateArea(newProject.length, newProject.width)} sq ft</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Rate per Sq Ft *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-400 transition-all duration-300"
                    value={newProject.ratePerSqFt}
                    onChange={(e) => setNewProject({ ...newProject, ratePerSqFt: e.target.value })}
                  />
                </div>
                <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-xl border-2 border-green-300">
                  <label className="block text-sm font-bold text-green-700 mb-1 uppercase tracking-wide">Total Amount</label>
                  <p className="text-3xl font-bold text-green-800">{formatCurrency(calculateTotal(calculateArea(newProject.length, newProject.width), newProject.ratePerSqFt))}</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Description</label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-400 transition-all duration-300"
                    rows={3}
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button
                  type="submit"
                  className="btn-glow flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-xl hover:from-green-700 hover:to-teal-700 font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  Add Project
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddProject(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Bill Modal */}
      {showAddBill && selectedClient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl transform animate-slideInUp border-2 border-orange-200">
            <h2 className="text-3xl font-bold mb-2 gradient-text flex items-center gap-3">
              <FileText className="w-8 h-8" />
              Add New Bill
            </h2>
            <p className="text-gray-600 mb-6">for {selectedClient.name}</p>
            <form onSubmit={handleAddBill}>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Total Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-300 focus:border-orange-400 transition-all duration-300"
                    value={newBill.totalAmount}
                    onChange={(e) => setNewBill({ ...newBill, totalAmount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Project (Optional)</label>
                  <select
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-300 focus:border-orange-400 transition-all duration-300 bg-white"
                    value={newBill.projectId}
                    onChange={(e) => setNewBill({ ...newBill, projectId: e.target.value })}
                  >
                    <option value="">Select a project</option>
                    {selectedClient.projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name} - {formatCurrency(project.totalAmount)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Due Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-300 focus:border-orange-400 transition-all duration-300"
                    value={newBill.dueDate}
                    onChange={(e) => setNewBill({ ...newBill, dueDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Notes</label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-300 focus:border-orange-400 transition-all duration-300"
                    rows={3}
                    value={newBill.notes}
                    onChange={(e) => setNewBill({ ...newBill, notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button
                  type="submit"
                  className="btn-glow flex-1 bg-gradient-to-r from-orange-600 to-pink-600 text-white py-3 rounded-xl hover:from-orange-700 hover:to-pink-700 font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  Add Bill
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddBill(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoice && selectedClient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl transform animate-slideInUp max-h-[90vh] overflow-y-auto">
            {/* Print Styles */}
            <style jsx>{`
              @media print {
                body * {
                  visibility: hidden;
                }
                .invoice-content, .invoice-content * {
                  visibility: visible;
                }
                .invoice-content {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                }
                .no-print {
                  display: none !important;
                }
              }
            `}</style>

            <div className="invoice-content p-12">
              {/* Invoice Header */}
              <div className="border-b-4 border-purple-600 pb-6 mb-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-5xl font-bold gradient-text mb-2">INVOICE</h1>
                    <p className="text-gray-600 text-lg">Professional Billing System</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Invoice Date</p>
                    <p className="text-lg font-bold text-gray-800">{new Date().toLocaleDateString('en-PK')}</p>
                    <p className="text-sm text-gray-600 mt-2">Invoice #</p>
                    <p className="text-lg font-bold text-purple-600">{`INV-${Date.now().toString().slice(-6)}`}</p>
                  </div>
                </div>
              </div>

              {/* Client Information */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-2xl border-2 border-purple-200">
                  <h3 className="text-sm font-bold text-purple-700 uppercase tracking-wide mb-3">Bill To</h3>
                  <p className="text-2xl font-bold text-gray-800 mb-2">{selectedClient.name}</p>
                  {selectedClient.phone && (
                    <p className="text-gray-600 flex items-center gap-2">
                      <span className="font-semibold">Phone:</span> {selectedClient.phone}
                    </p>
                  )}
                  {selectedClient.address && (
                    <p className="text-gray-600 flex items-center gap-2 mt-1">
                      <span className="font-semibold">Address:</span> {selectedClient.address}
                    </p>
                  )}
                </div>
                <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-2xl border-2 border-green-200">
                  <h3 className="text-sm font-bold text-green-700 uppercase tracking-wide mb-3">Invoice Type</h3>
                  <p className="text-xl font-bold text-gray-800">
                    {invoiceType === 'client' ? 'Complete Client Invoice' : 'Project Invoice'}
                  </p>
                  {invoiceType === 'project' && selectedProjectForInvoice && (
                    <p className="text-gray-600 mt-2">Project: {selectedProjectForInvoice.name}</p>
                  )}
                </div>
              </div>

              {/* Invoice Items */}
              {invoiceType === 'client' ? (
                <>
                  {/* All Projects */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Calculator className="w-6 h-6 text-blue-600" />
                      Projects Summary
                    </h3>
                    <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                          <tr>
                            <th className="text-left p-4 font-bold">Project Name</th>
                            <th className="text-center p-4 font-bold">Area (sq ft)</th>
                            <th className="text-right p-4 font-bold">Rate/sq ft</th>
                            <th className="text-right p-4 font-bold">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedClient.projects.map((project, idx) => (
                            <tr key={project.id} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                              <td className="p-4 font-semibold text-gray-800">{project.name}</td>
                              <td className="p-4 text-center text-blue-700 font-bold">{project.area} sq ft</td>
                              <td className="p-4 text-right text-gray-700">{formatCurrency(project.ratePerSqFt)}</td>
                              <td className="p-4 text-right font-bold text-green-700">{formatCurrency(project.totalAmount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* All Bills */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <FileText className="w-6 h-6 text-orange-600" />
                      Bills Summary
                    </h3>
                    <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-orange-600 to-pink-600 text-white">
                          <tr>
                            <th className="text-left p-4 font-bold">Bill Number</th>
                            <th className="text-center p-4 font-bold">Status</th>
                            <th className="text-right p-4 font-bold">Total</th>
                            <th className="text-right p-4 font-bold">Paid</th>
                            <th className="text-right p-4 font-bold">Outstanding</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedClient.bills.map((bill, idx) => (
                            <tr key={bill.id} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                              <td className="p-4 font-semibold text-gray-800">{bill.billNumber}</td>
                              <td className="p-4 text-center">
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                  bill.status === 'PAID' ? 'bg-green-200 text-green-800' :
                                  bill.status === 'PARTIAL' ? 'bg-yellow-200 text-yellow-800' :
                                  bill.status === 'OVERDUE' ? 'bg-red-200 text-red-800' :
                                  'bg-gray-200 text-gray-800'
                                }`}>
                                  {bill.status}
                                </span>
                              </td>
                              <td className="p-4 text-right text-blue-700 font-bold">{formatCurrency(bill.totalAmount)}</td>
                              <td className="p-4 text-right text-green-700 font-bold">{formatCurrency(bill.paidAmount)}</td>
                              <td className="p-4 text-right text-red-700 font-bold">{formatCurrency(bill.outstandingAmount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Complete Summary */}
                  <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 p-8 rounded-2xl border-4 border-purple-300">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Complete Summary</h3>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="bg-white p-6 rounded-xl text-center shadow-lg">
                        <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide mb-2">Total Amount</p>
                        <p className="text-3xl font-bold text-blue-700">{formatCurrency(getTotalAmount(selectedClient))}</p>
                      </div>
                      <div className="bg-white p-6 rounded-xl text-center shadow-lg">
                        <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide mb-2">Total Paid</p>
                        <p className="text-3xl font-bold text-green-700">{formatCurrency(getTotalPaid(selectedClient))}</p>
                      </div>
                      <div className="bg-white p-6 rounded-xl text-center shadow-lg border-4 border-red-300">
                        <p className="text-sm text-red-700 font-bold uppercase tracking-wide mb-2">Total Pending</p>
                        <p className="text-4xl font-bold text-red-700">{formatCurrency(getTotalOutstanding(selectedClient))}</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : selectedProjectForInvoice && (
                <>
                  {/* Single Project Details */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Calculator className="w-6 h-6 text-blue-600" />
                      Project Details
                    </h3>
                    <div className="bg-gradient-to-br from-blue-50 to-teal-50 p-8 rounded-2xl border-2 border-blue-200">
                      <h4 className="text-3xl font-bold text-gray-800 mb-6">{selectedProjectForInvoice.name}</h4>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white p-5 rounded-xl">
                          <p className="text-sm text-gray-600 font-semibold mb-2">Dimensions</p>
                          <p className="text-2xl font-bold text-blue-700">{selectedProjectForInvoice.length} × {selectedProjectForInvoice.width} ft</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl">
                          <p className="text-sm text-gray-600 font-semibold mb-2">Total Area</p>
                          <p className="text-2xl font-bold text-blue-700">{selectedProjectForInvoice.area} sq ft</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl">
                          <p className="text-sm text-gray-600 font-semibold mb-2">Rate per Square Foot</p>
                          <p className="text-2xl font-bold text-green-700">{formatCurrency(selectedProjectForInvoice.ratePerSqFt)}</p>
                        </div>
                        <div className="bg-gradient-to-r from-green-100 to-teal-100 p-5 rounded-xl border-4 border-green-400">
                          <p className="text-sm text-green-800 font-bold mb-2 uppercase">Total Project Amount</p>
                          <p className="text-3xl font-bold text-green-800">{formatCurrency(selectedProjectForInvoice.totalAmount)}</p>
                        </div>
                      </div>
                      {selectedProjectForInvoice.description && (
                        <div className="mt-6 bg-white p-5 rounded-xl">
                          <p className="text-sm text-gray-600 font-semibold mb-2">Description</p>
                          <p className="text-gray-800 italic">{selectedProjectForInvoice.description}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Project Bills */}
                  {selectedProjectForInvoice.bills && selectedProjectForInvoice.bills.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FileText className="w-6 h-6 text-orange-600" />
                        Related Bills
                      </h3>
                      <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gradient-to-r from-orange-600 to-pink-600 text-white">
                            <tr>
                              <th className="text-left p-4 font-bold">Bill Number</th>
                              <th className="text-center p-4 font-bold">Status</th>
                              <th className="text-right p-4 font-bold">Total</th>
                              <th className="text-right p-4 font-bold">Paid</th>
                              <th className="text-right p-4 font-bold">Outstanding</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedProjectForInvoice.bills.map((bill, idx) => (
                              <tr key={bill.id} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                <td className="p-4 font-semibold text-gray-800">{bill.billNumber}</td>
                                <td className="p-4 text-center">
                                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                    bill.status === 'PAID' ? 'bg-green-200 text-green-800' :
                                    bill.status === 'PARTIAL' ? 'bg-yellow-200 text-yellow-800' :
                                    bill.status === 'OVERDUE' ? 'bg-red-200 text-red-800' :
                                    'bg-gray-200 text-gray-800'
                                  }`}>
                                    {bill.status}
                                  </span>
                                </td>
                                <td className="p-4 text-right text-blue-700 font-bold">{formatCurrency(bill.totalAmount)}</td>
                                <td className="p-4 text-right text-green-700 font-bold">{formatCurrency(bill.paidAmount)}</td>
                                <td className="p-4 text-right text-red-700 font-bold">{formatCurrency(bill.outstandingAmount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Footer */}
              <div className="mt-8 pt-6 border-t-2 border-gray-300 text-center">
                <p className="text-gray-600 text-sm">Thank you for your business!</p>
                <p className="text-gray-500 text-xs mt-2">This is a computer-generated invoice.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="no-print flex gap-4 p-6 bg-gray-50 border-t-2 border-gray-200">
              <button
                onClick={printInvoice}
                className="btn-glow flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                🖨️ Print Invoice
              </button>
              <button
                onClick={() => setShowInvoice(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 font-semibold shadow-md hover:shadow-lg transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
