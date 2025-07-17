import React from 'react'
import { Toaster } from '@/components/ui/toaster'
import Dashboard from '@/components/Dashboard'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Dashboard />
      <Toaster />
    </div>
  )
}

export default App