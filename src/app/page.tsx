'use client';

import ReactAlertSample from '@/components/ReactAlertSample';
import { useWalletContext } from '@/context/wallet';
import { useGlobalState } from '@/lib/store';
import { useHookstate } from '@hookstate/core';

export default function Home() {
  const gState = useGlobalState();
  const { Connect, Logout, contracts, alert } = useWalletContext();
  const balance = useHookstate(0);

  const getBusdBal = async () => {
    try {
      const data = await contracts.busd.balanceOf(gState.wallet.value);
      console.log('TEST: ', data);

      const bal = await toBUSD(data.toString());
      balance.set(bal);
      alert.success(`Balance: ${bal}`);
    } catch (e) {
      console.error(e);
    }
  };

  const toBUSD = async (price) => {
    const usdtDecimal = await contracts.busd.decimals();
    return Number(price) / 10 ** Number(usdtDecimal);
  };

  return (
    <main className="bg-gray-200">
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-bold text-red-500">
          Next-Tailwind Starter Template with Web3Auth
        </h1>

        <div>
          {!gState['verify'].value && (
            <button
              onClick={Connect}
              className="rounded-md bg-green-500 px-4 py-2 text-white transition duration-300 ease-in-out hover:bg-green-600 active:scale-95"
            >
              Connect Wallet
            </button>
          )}

          {gState['verify'].value && (
            <button
              onClick={Logout}
              className="rounded-md bg-red-500 px-4 py-2 text-white transition duration-300 ease-in-out hover:bg-red-600 active:scale-95"
            >
              Disconnect
            </button>
          )}

          {gState['verify'].value && (
            <div>
              <div className="mt-4 text-center">
                <div>Status:</div>
                <div>{gState.wallet.value}</div>
              </div>

              <div className="flex flex-col items-center">
                <button
                  onClick={getBusdBal}
                  className="rounded-lg bg-green-500 px-6 py-2 text-white hover:bg-green-600 active:scale-95"
                >
                  GET BUSD BALANCE
                </button>
                <div>{`BUSD Balance: ${balance.value.toLocaleString()}`}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
