// Este arquivo foi neutralizado para o desacoplamento do frontend.
// A lógica de atualização de token não é necessária em um ambiente mockado.

export interface RefreshResult {
  success: boolean;
  newToken?: string;
  error?: string;
}

export async function autoRefreshToken(): Promise<RefreshResult> {
  console.warn("autoRefreshToken foi chamado, mas está desativado em modo desacoplado.");
  return { success: false, error: 'Função desativada em modo desacoplado.' };
}

export function withAutoRefresh<T>(fn: () => Promise<T>): Promise<T> {
  // Simplesmente executa a função original sem a lógica de refresh.
  return fn();
}
