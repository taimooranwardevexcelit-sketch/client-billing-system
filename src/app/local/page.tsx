import ClientBillingSystem from '@/components/ClientBillingSystem'
import Link from 'next/link'

export default function LocalPage() {
  return (
    <main className="min-h-screen">
      {/* Back Button */}
      <div className="fixed top-4 left-4 z-50">
        <Link 
          href="/" 
          className="btn-glow bg-white/90 backdrop-blur-sm text-purple-700 px-5 py-3 rounded-xl hover:bg-white flex items-center gap-2 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-semibold border-2 border-purple-200"
        >
          ← Back to Home
        </Link>
      </div>
      <ClientBillingSystem />
    </main>
  )
}
