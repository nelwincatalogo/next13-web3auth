'use client';

import { CHAIN_NAMESPACES } from '@web3auth/base';

/* eslint-disable import/no-anonymous-default-export */

export const currentNetwork = Number(process.env.NEXT_PUBLIC_NETWORK) || 0;
export const config = [
  {
    api_url: 'https://stg-api.anitolegends.com/v2',
    chainConfig: {
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      chainId: '0x61',
      rpcTarget: 'https://data-seed-prebsc-1-s1.binance.org:8545',
      displayName: 'Binance Smart Chain - Testnet',
      blockExplorer: 'https://testnet.bscscan.com/',
      ticker: 'tBNB',
      tickerName: 'Testnet BNB',
    },
  },
  {
    api_url: 'https://stg-api.anitolegends.com/v2',
    chainConfig: {
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      chainId: '0x61',
      rpcTarget: 'https://data-seed-prebsc-1-s1.binance.org:8545',
      displayName: 'Binance Smart Chain - Testnet',
      blockExplorer: 'https://testnet.bscscan.com/',
      ticker: 'tBNB',
      tickerName: 'Testnet BNB',
    },
  },
];

export default {
  project: 'next13_tailwindcss_with_connect_wallet',
  setting: config[currentNetwork],
  isTestnet: Number(currentNetwork) === 0,
};
