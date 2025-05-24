export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
        <span className="mt-4 text-text-secondary font-medium">Carregando...</span>
      </div>
    </div>
  )
}

export function LoadingSpinner({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  const sizeClasses = {
    small: 'h-5 w-5 border-2',
    medium: 'h-12 w-12 border-4',
    large: 'h-16 w-16 border-4'
  }

  return (
    <div className="flex flex-col items-center">
      <div className={`animate-spin rounded-full border-primary/20 border-t-primary ${sizeClasses[size]}`}></div>
      <span className={`mt-2 text-text-secondary font-medium ${size === 'small' ? 'text-sm' : 'text-base'}`}>
        Carregando...
      </span>
    </div>
  )
}

export function LoadingButton({ 
  loading, 
  children, 
  variant = 'primary',
  ...props 
}: { 
  loading: boolean; 
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const baseClasses = "relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantClasses = {
    primary: "text-white bg-primary hover:bg-primary-dark focus:ring-primary",
    secondary: "text-text-primary bg-white border border-border hover:bg-background-start focus:ring-primary"
  };

  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${props.className || ''}`}
    >
      {loading ? (
        <>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`animate-spin h-5 w-5 border-2 rounded-full ${
              variant === 'primary' 
                ? 'border-white/30 border-t-white' 
                : 'border-primary/30 border-t-primary'
            }`}></div>
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
    <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm shadow-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
        {message && <span className="mt-4 text-text-secondary font-medium">{message}</span>}
      </div>
    </div>
  )
}

export function LoadingCard() {
  return (
    <div className="animate-pulse bg-white shadow-sm rounded-xl p-6">
      <div className="h-4 bg-background-start rounded-full w-3/4 mb-4"></div>
      <div className="space-y-3">
        <div className="h-3 bg-background-start rounded-full"></div>
        <div className="h-3 bg-background-start rounded-full w-5/6"></div>
        <div className="h-3 bg-background-start rounded-full w-4/6"></div>
      </div>
      <div className="mt-6 h-8 bg-background-start rounded-xl"></div>
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
