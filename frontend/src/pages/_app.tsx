import '@/styles/ref/animate.min.css'
import '@rainbow-me/rainbowkit/styles.css';
import '@/styles/globals.css'
import '@/styles/flow.css'
import '@/styles/light.css'
import '@/styles/new.css'
import '@/styles/style.css'
import '@/styles/index.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'


import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, bsc, hardhat } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

const { chains, publicClient } = configureChains(
  [bsc, hardhat],
  [
    alchemyProvider({ apiKey: 'NMhfPuABhkRSqlRoJpNrhMmA7gIZdLy0' }),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  projectId: 'YOUR_PROJECT_ID',
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
})


export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains} theme={darkTheme()}>
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
            <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500&family=Inter:wght@400;500&display=swap" rel="stylesheet" />
          </Head>
          <div >
            <Component {...pageProps} />
          </div >
        </RainbowKitProvider>
      </WagmiConfig>
    </>
  )
}
