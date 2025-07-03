'use client'

export default function AdminReportsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-full w-full">
      {children}
    </div>
  )
}