/**
 * Demo Mode Banner
 *
 * Shows a warning banner when the app auto-falls back to demo mode
 * due to missing Supabase credentials.
 */

import { isAutoFallbackMode } from '@/lib/supabase'
import { AlertCircle, X } from 'lucide-react'
import { useState } from 'react'

export function DemoModeBanner() {
  const [dismissed, setDismissed] = useState(false)

  // Only show in auto-fallback mode (not when explicitly set)
  if (!isAutoFallbackMode || dismissed) {
    return null
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
      <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="w-0 flex-1 flex items-center">
            <span className="flex p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/40">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" aria-hidden="true" />
            </span>
            <p className="ml-3 font-medium text-sm text-yellow-800 dark:text-yellow-200">
              <span className="inline">
                Running in <strong>Demo Mode</strong> - using mock data (Supabase credentials not configured)
              </span>
              <span className="hidden sm:inline ml-2 text-yellow-700 dark:text-yellow-300">
                • Login: demo@example.com / any password
              </span>
            </p>
          </div>
          <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="-mr-1 flex p-2 rounded-md hover:bg-yellow-100 dark:hover:bg-yellow-900/60 focus:outline-none focus:ring-2 focus:ring-yellow-600 sm:-mr-2"
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-5 w-5 text-yellow-600 dark:text-yellow-500" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
