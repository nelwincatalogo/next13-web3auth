'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Web3Auth } from '@web3auth/modal';
import { useAlert } from 'react-alert';
import { Contract, ethers } from 'ethers';
import {
  CHAIN_NAMESPACES,
  ADAPTER_EVENTS,
  CONNECTED_EVENT_DATA,
} from '@web3auth/base';
import { LOGIN_MODAL_EVENTS } from '@web3auth/ui';
import axios, { BLOCKCHAIN } from '@/api';
import { useGlobalState } from '@/store';
import CONFIG from '@/config';

export const WalletContext = createContext<any>({});
export const useWalletContext = () => useContext(WalletContext);

export default function WalletProvider({ children }: any) {
  const alert = useAlert();
  const gState = useGlobalState();
  const [web3auth, setWeb3auth] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contracts, setContracts] = useState(null);
  const [isConnected, setConnected] = useState(false);

  async function onLoad() {
    await fetchBlockchain();

    //Initialize within your constructor
    const _web3auth = await initWeb3Auth();
    await _web3auth.initModal();
    const _provider = new ethers.JsonRpcProvider(
      CONFIG.setting.chainConfig.rpcTarget
    );
    subscribeAuthEvents(_web3auth);

    setWeb3auth(_web3auth);
    setProvider(_provider);
  }

  async function initWeb3Auth() {
    const web3auth = new Web3Auth({
      clientId: process.env.NEXT_PUBLIC_CLIENTID, // Get your Client ID from Web3Auth Dashboard
      chainConfig: CONFIG.setting.chainConfig,
    });
    return web3auth;
  }

  async function Connect() {
    try {
      if (web3auth.status === 'connected') {
        await Logout();
      }

      const _provider = await web3auth.connect();
      console.log('_provider: ', _provider);
    } catch (e) {
      console.error('Connect:', e);
    }
  }

  async function Logout() {
    await web3auth.logout();
    gState.wallet.set('');
    gState['verify'].set(null);
    setConnected(false);
  }

  const subscribeAuthEvents = (web3auth: Web3Auth) => {
    web3auth.on(
      ADAPTER_EVENTS.CONNECTED,
      async (data: CONNECTED_EVENT_DATA) => {
        console.log('web3auth: ', web3auth.provider);

        const __provider = new ethers.BrowserProvider(web3auth.provider);
        const _signer = await __provider.getSigner();

        // const info = await web3auth.authenticateUser();
        // console.info('info: ', info);

        // const privateKey = await web3auth.provider.request({
        //   method: 'eth_private_key',
        // });
        // console.log('privateKey: ', privateKey);

        console.log('SIGNER: ', _signer);
        setProvider(_signer);

        gState.wallet.set(_signer.address);
        setConnected(web3auth.status == 'connected');
      }
    );
    web3auth.on(ADAPTER_EVENTS.CONNECTING, () => {
      console.log('connecting');
    });
    web3auth.on(ADAPTER_EVENTS.DISCONNECTED, () => {
      console.log('disconnected');
    });
    web3auth.on(ADAPTER_EVENTS.ERRORED, (error) => {
      console.log('error', error);
    });
    web3auth.on(LOGIN_MODAL_EVENTS.MODAL_VISIBILITY, (isVisible) => {
      console.log('is modal visible', isVisible);
    });
  };

  async function fetchBlockchain() {
    try {
      const blockchainData = await axios
        .get(BLOCKCHAIN)
        .then((res) => res.data);
      gState['blockchain'].set(blockchainData);

      const nft = {
        address: blockchainData.anito_address,
        abi: blockchainData.anito_abi,
      };
      const busd = {
        address: blockchainData.busd_address,
        abi: blockchainData.busd_abi,
      };

      gState['contracts'].set({ nft, busd });
    } catch (error) {
      console.error('fetchBlockchain: ', error);
    }
  }

  async function loadContract() {
    if (!provider) return;

    try {
      const nft = new Contract(
        gState['contracts']['nft']['address'].get({ noproxy: true }),
        gState['contracts']['nft']['abi'].get({ noproxy: true }),
        provider
      );

      const busd = new Contract(
        gState['contracts']['busd']['address'].get({ noproxy: true }),
        gState['contracts']['busd']['abi'].get({ noproxy: true }),
        provider
      );

      setContracts({
        nft,
        busd,
      });
    } catch (error) {
      console.error('loadContract: ', error);
    }
  }

  useEffect(() => {
    loadContract();
  }, [provider]);

  useEffect(() => {
    if (isConnected) {
      grecaptcha();
    }
  }, [isConnected, provider]);

  useEffect(() => {
    onLoad();
  }, []);

  /**
   * WARNING: Don't mess with what's below unless you know what you are doing!
   */

  const grecaptcha = async () => {
    if (window.grecaptcha) {
      try {
        window.grecaptcha.ready((_) => {
          executeGrecapcha(CONFIG.project);
        });
      } catch (error) {
        console.error('grecaptcha: ', error);
      }
    }
  };

  const executeGrecapcha = async (action) => {
    try {
      // execute grecapcha
      const _gToken = await window.grecaptcha.execute(
        process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
        { action }
      );

      // request metamask for signing
      const _metamaskReq = await axios
        .post('/login/request', {
          address: gState.wallet.value,
          'g-recaptcha-response': _gToken,
        })
        .then((res) => res.data);

      alert.info(_metamaskReq.message);
      console.log('PROVIDER: ', provider);
      const signature = await provider.signMessage(_metamaskReq.data);

      // verify signed token
      const verify = await axios
        .post('/login/verify', {
          address: gState.wallet.value,
          signature,
        })
        .then((res) => res.data);

      alert.success(verify.message);
      localStorage.setItem('token', verify.token);
      gState['verify'].set(verify);
    } catch (error) {
      console.warn('executeGrecapcha: ', error);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        alert,
        gState,
        web3auth,
        provider,
        contracts,
        Connect,
        Logout,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
