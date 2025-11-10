import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { Amplify } from 'aws-amplify'
import outputs from '../amplify_outputs.json'

// Configure Amplify before rendering
try {
  Amplify.configure(outputs)
  console.log('✅ Amplify configured successfully')
} catch (error) {
  console.error('❌ Failed to configure Amplify:', error)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
