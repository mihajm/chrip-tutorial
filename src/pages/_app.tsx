import { type AppType } from 'next/app';

import { api } from '~/utils/api';

import { ClerkProvider } from '@clerk/nextjs';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import '~/styles/globals.css';

const MyApp: AppType = ({ Component, pageProps }) => {
  
  return (
    <ClerkProvider>
      <Head>
        <title>Chirp tutorial</title>
        <meta name="description" content="Tutorial twitter clone, built with t3" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Toaster />
      <Component {...pageProps} />
    </ClerkProvider>);
};

export default api.withTRPC(MyApp);
