'use client';

import { transitions, positions, Provider as AlertProvider } from 'react-alert';
import AlertTemplate from '@/components/AlertTemplate';

import '@/styles/globals.css';
import { Inter } from 'next/font/google';
import WalletProvider from '@/context/wallet';
import { useEffect, useState } from 'react';

const inter = Inter({ subsets: ['latin'] });

const options = {
  // you can also just use 'bottom center'
  position: positions.TOP_RIGHT,
  timeout: 2500,
  offset: '20px',
  // you can also just use 'scale'
  transition: transitions.FADE,
};

declare global {
  interface Window {
    grecaptcha: any;
    dataLayer: any;
  }
}

export default function RootLayout({ children }) {
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

  useEffect(() => {
    if (recaptchaLoaded) return;
    const handleLoaded = (_) => {
      window.grecaptcha.ready();
    };
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`;
    document.body.appendChild(script);
    script.addEventListener('load', handleLoaded);
    setRecaptchaLoaded(true);
  }, [recaptchaLoaded]);

  return (
    <html lang="en">
      <body className={inter.className}>
        <AlertProvider template={AlertTemplate} {...options}>
          <WalletProvider>{children}</WalletProvider>
        </AlertProvider>
      </body>
    </html>
  );
}
