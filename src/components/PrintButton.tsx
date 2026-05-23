'use client'

import { Printer } from 'lucide-react'

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="flex items-center gap-2 px-6 py-2.5 bg-[#0066cc] hover:bg-[#0055b3] text-white rounded-xl text-sm font-bold shadow-sm transition-all"
    >
      <Printer className="w-4 h-4" />
      <span>Daabac Rasiidhka</span>
    </button>
  )
}
