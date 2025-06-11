import TestConnection from '../test-connection'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'

export default function TestConnectionPage() {
  return (
    <AuthenticatedLayout>
      <TestConnection />
    </AuthenticatedLayout>
  )
}