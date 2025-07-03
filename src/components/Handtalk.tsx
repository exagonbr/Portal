'use client'

import { useEffect, useState } from 'react';
import { HT } from '@/lib/handtalk';

interface HandtalkProps {
  token: string;
}

export function Handtalk({ token }: HandtalkProps): null {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      const htInstance = HT.getInstance({ token: token });
      setInitialized(true);
    }
  }, [token, initialized]);

  // Este componente não renderiza nada
  return null;
}

export default Handtalk; 