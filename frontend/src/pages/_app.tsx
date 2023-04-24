import '@/styles/globals.css'
import '@/styles/ref/bundle2.min.css'
import '@/styles/ref/animate.min.css'
import '@/styles/ref/index.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@300&display=swap" rel="stylesheet" />
      </Head>
      <div style={{ userSelect: 'none' }}>
        <div className="banner"><img className="banner-left" src="/ref/horleft.svg" loading="lazy" alt="" />
          <div className="banner-text" style={{ fontSize: '12px', fontWeight: '600' }}>Become an Early Adopter &amp; get access to unique features</div>
          <img className="banner-right" src="/ref/horright.svg" loading="lazy" alt="" />
        </div>
        <Component {...pageProps} />
      </div >
    </>
  )
}
