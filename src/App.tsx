import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import './App.css'

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">SMASH SCRAP</h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">Welcome, {user?.signInDetails?.loginId}</span>
                <button
                  onClick={signOut}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Welcome to SMASH SCRAP Inventory Management
              </h2>
              <p className="text-gray-600 mb-4">
                You are now logged in to the system. This is the foundation of your
                multi-tenant salvage yard management platform.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="text-lg font-medium text-blue-900 mb-2">Authentication Status: ✅ Active</h3>
                <p className="text-sm text-blue-700">User ID: {user?.userId}</p>
                <p className="text-sm text-blue-700">Email: {user?.signInDetails?.loginId}</p>
              </div>
            </div>
          </main>
        </div>
      )}
    </Authenticator>
  )
}

export default App
