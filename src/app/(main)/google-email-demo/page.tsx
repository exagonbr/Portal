import { Metadata } from 'next';
import GoogleEmailDemo from '@/components/email/GoogleEmailDemo';

export const metadata: Metadata = {
  title: 'Google Email Service - Portal Sabercon',
  description: 'Demonstração do serviço desacoplado Google Email integrado ao Portal Sabercon',
};

export default function GoogleEmailDemoPage() {
  return <GoogleEmailDemo />;
} 