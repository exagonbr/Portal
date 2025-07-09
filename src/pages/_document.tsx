import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        <script src="/chunk-config.js" defer />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
