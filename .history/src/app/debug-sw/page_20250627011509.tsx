import ServiceWorkerDebug from '@/components/ServiceWorkerDebug';
import Script from 'next/script';

export default function DebugServiceWorkerPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Debug do Service Worker</h1>
        <p className="text-gray-600">
          Use esta página para diagnosticar e resolver problemas com o Service Worker.
        </p>
      </div>
      
      <ServiceWorkerDebug />
      
      <div className="mt-8 space-y-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium mb-2">Instruções:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Clique em "Verificar Status" para ver o estado atual do Service Worker</li>
            <li>Se houver problemas, tente "Limpar Cache" para remover dados corrompidos</li>
            <li>Use "Recarregar Assets" para tentar carregar novamente recursos problemáticos</li>
            <li>Clique em "Testar APIs" para verificar se as URLs duplicadas foram corrigidas</li>
            <li>Se nada funcionar, use "Recarregar Página" para um reset completo</li>
          </ol>
        </div>

        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="font-medium mb-2">✅ Correções Implementadas:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>URLs duplicadas corrigidas:</strong> ServiceWorker não intercepta mais requisições /api/</li>
            <li><strong>Tratamento de CSS melhorado:</strong> Assets do Next.js têm estratégia específica</li>
            <li><strong>Fallbacks robustos:</strong> Respostas de erro apropriadas para diferentes tipos de recursos</li>
            <li><strong>Logs detalhados:</strong> Melhor diagnóstico de problemas</li>
          </ul>
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-medium mb-2">🔧 Teste via Console:</h3>
          <p className="text-sm mb-2">Abra o console do navegador (F12) e execute:</p>
          <div className="bg-gray-800 text-green-400 p-3 rounded font-mono text-sm">
            <div>// Carregar script de teste</div>
            <div>const script = document.createElement('script');</div>
            <div>script.src = '/test-sw-fix.js';</div>
            <div>document.head.appendChild(script);</div>
            <div className="mt-2">// Após carregar, testar:</div>
            <div>testServiceWorkerFix();</div>
          </div>
        </div>

        <div className="p-4 bg-red-50 rounded-lg">
          <h3 className="font-medium mb-2">🚨 Comandos de Emergência:</h3>
          <p className="text-sm mb-2">Se o problema persistir, use no console:</p>
          <div className="bg-gray-800 text-red-400 p-3 rounded font-mono text-sm">
            <div>// Limpar tudo e recarregar</div>
            <div>(async () => {'{'}</div>
            <div>  const caches = await window.caches.keys();</div>
            <div>  await Promise.all(caches.map(c => window.caches.delete(c)));</div>
            <div>  const regs = await navigator.serviceWorker.getRegistrations();</div>
            <div>  await Promise.all(regs.map(r => r.unregister()));</div>
            <div>  window.location.reload();</div>
            <div>{'})()'};</div>
          </div>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg">
          <h3 className="font-medium mb-2">📊 Problema Original:</h3>
          <p className="text-sm mb-2">
            <strong>Erro:</strong> "Falha ao carregar '/_next/static/css/vendors-node_modules_g.css'. 
            Um ServiceWorker interceptou a requisição e encontrou um erro não esperado."
          </p>
          <p className="text-sm">
            <strong>Causa:</strong> O ServiceWorker estava criando URLs duplicadas (/api/api/) e 
            não tratava adequadamente recursos CSS do Next.js.
          </p>
        </div>

        <div className="p-4 bg-amber-50 rounded-lg">
          <h3 className="font-medium mb-2">🔐 Debug de Autenticação (Erro 401):</h3>
          <p className="text-sm mb-2">
            <strong>Problema:</strong> API retornando "Token inválido ou expirado" (Status 401)
          </p>
          <div className="text-sm space-y-1">
            <p><strong>Passos para diagnosticar:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Clique em "Diagnosticar Auth" para verificar o token</li>
              <li>Abra o console (F12) para ver detalhes do diagnóstico</li>
              <li>Verifique se o token existe e não está expirado</li>
              <li>Se o token estiver expirado, faça login novamente</li>
              <li>Se o problema persistir, clique em "Limpar Auth" e faça login</li>
            </ol>
          </div>
          <div className="mt-2 p-2 bg-gray-800 text-amber-400 rounded font-mono text-xs">
            <div>// Para debug manual no console:</div>
            <div>debugAuth(); // Diagnóstico completo</div>
            <div>testTokenDirectly(); // Verificar token</div>
            <div>testMultipleEndpoints(); // Testar APIs</div>
          </div>
        </div>
      </div>

      {/* Carregar script de teste */}
      <Script src="/test-sw-fix.js" strategy="lazyOnload" />
    </div>
  );
} 