import React from 'react'
import ReactDOM from 'react-dom/client'
import PlannerV5 from './PlannerV5.jsx'
import { storage } from './supabaseClient.js'

// Wire up window.storage to our Supabase-backed storage
window.storage = storage

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PlannerV5 />
  </React.StrictMode>
)
