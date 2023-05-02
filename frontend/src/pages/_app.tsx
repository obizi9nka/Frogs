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
        <meta charSet="utf-8" />
        <title>FrogsFi 🐸</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#92cc41" />
        <link rel="shortcut icon" type="image/png" href="/ref/favicon-32x32.png" />
        <link rel="shortcut icon" sizes="196x196" href="/ref/android-chrome-512x512.png" />
        <link rel="apple-touch-icon" href="icons/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin='' />
        <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@300&display=swap" rel="stylesheet" />
      </Head>
      <div style={{ userSelect: 'none' }}>
        <div className="banner">
          <img className="banner-left" src="/ref/horleft.svg" alt="" />
          <div className="banner-text" style={{}}>Become an Early Adopter &amp; get access to unique features</div>
          <img className="banner-right" src="/ref/horright.svg" alt="" />
        </div>
        <Component {...pageProps} />
      </div >
    </>
  )
}
