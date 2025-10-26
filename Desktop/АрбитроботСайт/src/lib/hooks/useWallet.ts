import { useState, useEffect, useCallback } from 'react';
import {
  web3Provider,
  connectWallet as connectWalletFn,
  disconnectWallet as disconnectWalletFn,
} from '../web3/provider';
import { plexContract } from '../web3/contracts/plex';
import { WEB3_CONFIG, WEB3_ERRORS, STORAGE_KEYS } from '../web3/config';

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null;
  isCorrectNetwork: boolean;
  balance: {
    bnb: string;
    plex: string;
  };
  error: string | null;
}

export interface UseWalletReturn extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchNetwork: () => Promise<void>;
  refreshBalance: () => Promise<void>;
}

const initialState: WalletState = {
  address: null,
  isConnected: false,
  isConnecting: false,
  chainId: null,
  isCorrectNetwork: false,
  balance: {
    bnb: '0',
    plex: '0',
  },
  error: null,
};

/**
 * Hook for managing Web3 wallet connection
 */
export function useWallet(): UseWalletReturn {
  const [state, setState] = useState<WalletState>(initialState);

  /**
   * Update balance
   */
  const refreshBalance = useCallback(async () => {
    if (!state.address) return;

    try {
      const [bnbBalance, plexBalance] = await Promise.all([
        web3Provider.getBalance(state.address),
        plexContract.balanceOf(state.address),
      ]);

      setState((prev) => ({
        ...prev,
        balance: {
          bnb: bnbBalance,
          plex: plexBalance,
        },
      }));
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  }, [state.address]);

  /**
   * Check network and update state
   */
  const checkNetwork = useCallback(async () => {
    try {
      const chainId = await web3Provider.getChainId();
      const isCorrect = chainId === WEB3_CONFIG.chainId;

      setState((prev) => ({
        ...prev,
        chainId,
        isCorrectNetwork: isCorrect,
        error: isCorrect ? null : WEB3_ERRORS.WRONG_NETWORK,
      }));

      return isCorrect;
    } catch (error) {
      console.error('Error checking network:', error);
      return false;
    }
  }, []);

  /**
   * Connect wallet
   */
  const connect = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      isConnecting: true,
      error: null,
    }));

    try {
      // Connect wallet
      const address = await connectWalletFn();

      // Check network
      const isCorrect = await checkNetwork();

      // Get balances
      const [bnbBalance, plexBalance] = await Promise.all([
        web3Provider.getBalance(address),
        plexContract.balanceOf(address),
      ]);

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, address);
      }

      setState({
        address,
        isConnected: true,
        isConnecting: false,
        chainId: await web3Provider.getChainId(),
        isCorrectNetwork: isCorrect,
        balance: {
          bnb: bnbBalance,
          plex: plexBalance,
        },
        error: isCorrect ? null : WEB3_ERRORS.WRONG_NETWORK,
      });
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      
      let errorMessage = 'Ошибка подключения кошелька';
      if (error.code === 4001) {
        errorMessage = WEB3_ERRORS.USER_REJECTED;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setState({
        ...initialState,
        error: errorMessage,
      });
    }
  }, [checkNetwork]);

  /**
   * Disconnect wallet
   */
  const disconnect = useCallback(async () => {
    await disconnectWalletFn();
    setState(initialState);
  }, []);

  /**
   * Switch to BSC network
   */
  const switchNetwork = useCallback(async () => {
    try {
      await web3Provider.switchNetwork();
      await checkNetwork();
    } catch (error: any) {
      console.error('Error switching network:', error);
      
      let errorMessage = 'Ошибка переключения сети';
      if (error.code === 4001) {
        errorMessage = WEB3_ERRORS.USER_REJECTED;
      }

      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
    }
  }, [checkNetwork]);

  /**
   * Handle account change
   */
  const handleAccountsChanged = useCallback(
    async (accounts: string[]) => {
      if (accounts.length === 0) {
        // Disconnected
        await disconnect();
      } else if (accounts[0] !== state.address) {
        // Account changed, reconnect
        await connect();
      }
    },
    [state.address, connect, disconnect]
  );

  /**
   * Handle chain change
   */
  const handleChainChanged = useCallback(async () => {
    // Check network instead of reloading page to prevent hydration issues
    await checkNetwork();
    // Optionally refresh balance
    if (state.address) {
      refreshBalance();
    }
  }, [checkNetwork, state.address, refreshBalance]);

  /**
   * Setup event listeners
   */
  useEffect(() => {
    // Задержка для предотвращения ошибок гидратации
    const timer = setTimeout(() => {
      if (typeof window === 'undefined' || !window.ethereum) {
        return;
      }
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [handleAccountsChanged, handleChainChanged]);

  /**
   * Auto-connect if previously connected
   * Run only once after hydration to prevent SSR mismatch
   */
  useEffect(() => {
    // Only run on client-side after initial mount
    if (typeof window === 'undefined') return;

    // Check if we should auto-connect
    const savedAddress = localStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS);

    if (savedAddress && !state.isConnected && !state.isConnecting) {
      // Add a small delay to ensure hydration is complete and avoid race conditions
      const timer = setTimeout(() => {
        connect();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Refresh balance periodically
   */
  useEffect(() => {
    if (!state.isConnected || !state.address) return;

    // Initial fetch
    refreshBalance();

    // Refresh every 30 seconds
    const interval = setInterval(refreshBalance, 30000);

    return () => clearInterval(interval);
  }, [state.isConnected, state.address, refreshBalance]);

  return {
    ...state,
    connect,
    disconnect,
    switchNetwork,
    refreshBalance,
  };
}
