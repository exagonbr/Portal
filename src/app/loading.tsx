export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="mt-4 text-gray-600">Carregando...</span>
      </div>
    </div>
  )
}

export function LoadingSpinner({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12',
    large: 'h-16 w-16'
  }

  return (
    <div className="flex flex-col items-center">
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
      <span className={`mt-2 text-gray-600 ${size === 'small' ? 'text-sm' : 'text-base'}`}>
        Carregando...
      </span>
    </div>
  )
}

export function LoadingButton({ loading, children, ...props }: { loading: boolean; children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`relative inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${props.className || ''}`}
    >
      {loading ? (
        <>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></div>
          </div>
          <span className="opacity-0">{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}

export function LoadingOverlay({ message }: { message?: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
      <div className="flex flex-col items-center p-4 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        {message && <span className="mt-4 text-gray-600">{message}</span>}
      </div>
    </div>
  )
}

export function LoadingCard() {
  return (
    <div className="animate-pulse bg-white shadow rounded-lg p-6">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="space-y-3">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
      </div>
      <div className="mt-6 h-8 bg-gray-200 rounded"></div>
    </div>
  )
}

export function LoadingGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  )
}
