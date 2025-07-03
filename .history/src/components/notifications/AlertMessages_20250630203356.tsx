'use client'

interface AlertMessagesProps {
  success?: boolean
  successMessage?: string
  error?: string | null
}

export default function AlertMessages({ success, successMessage, error }: AlertMessagesProps) {
  if (!success && !error) return null

  return (
    <>
      {success && successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-green-600">check_circle</span>
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-red-600">error</span>
          <p className="text-red-800">{error}</p>
        </div>
      )}
    </>
  )
}