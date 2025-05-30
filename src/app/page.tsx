import { LoginForm } from '../components/auth/LoginForm';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center" role="main">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden" aria-hidden="true">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute min-w-full min-h-full object-cover opacity-100"
          preload="auto"
        >
          <source src="/back_video4.mp4" type="video/mp4" />
          Seu navegador não suporta a tag de vídeo.
        </video>
      </div>

      {/* Content */}
      <div className="opacity-100 relative z-10 max-w-md w-full space-y-8 p-8 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl">
        <div className="text-center">
          <div className="relative w-48 h-16 mx-auto">
            <Image
              src="/sabercon-logo.png"
              alt="Sabercon Logo"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 192px, 192px"
            />
          </div>
        </div>

        <LoginForm />

        <div className="text-center mt-4">
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:text-primary-dark transition-colors duration-200"
            aria-label="Recuperar senha"
          >
            Esqueceu sua senha?
          </Link>
        </div>
      </div>
    </div>
  );
}
