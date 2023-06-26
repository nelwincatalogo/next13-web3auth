'use client';

import { hookstate, useHookstate } from '@hookstate/core';
import { devtools } from '@hookstate/devtools';

export const globalState = hookstate(
  {
    wallet: '',
    verify: null as any,
    blockchain: null as any,
    contracts: null as any,
  },
  devtools({ key: 'globalState' })
);

export const useGlobalState = () => useHookstate(globalState);
