'use client'

import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

/**
 * Test page for auth debugging
 * 
 * Use this to verify:
 * - User session loading
 * - Auth state changes
 * - Login/logout flow
 */
export default function TestAuthPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading auth state...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">🔍 Auth Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Current Auth State</h2>
          
          <div className="space-y-4">
            <div>
              <strong>Loading:</strong> 
              <span className={`ml-2 px-2 py-1 rounded ${loading ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                {loading ? 'true' : 'false'}
              </span>
            </div>
            
            <div>
              <strong>User:</strong> 
              <span className={`ml-2 px-2 py-1 rounded ${user ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {user ? 'Logged In' : 'Not Logged In'}
              </span>
            </div>

            {user && (
              <div className="bg-gray-50 p-4 rounded mt-4">
                <h3 className="font-bold mb-2">User Details:</h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Test Actions</h2>
          
          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition"
            >
              Go to Login Page
            </Link>
            
            <Link
              href="/"
              className="block w-full px-4 py-2 bg-gray-600 text-white text-center rounded-lg hover:bg-gray-700 transition"
            >
              Go to Home
            </Link>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Reload Page (Test Session Persistence)
            </button>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-bold mb-2">📝 Test Checklist:</h3>
          <ul className="space-y-1 text-sm">
            <li>□ Page loads without errors</li>
            <li>□ Auth state shows correctly</li>
            <li>□ Can navigate to login page</li>
            <li>□ Can login with Google</li>
            <li>□ After login, user details show here</li>
            <li>□ After reload, still logged in</li>
            <li>□ Header shows user info</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
