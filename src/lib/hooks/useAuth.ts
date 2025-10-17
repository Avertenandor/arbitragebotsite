import { useState, useCallback } from 'react';
import { plexContract } from '../web3/contracts/plex';
import { WEB3_CONFIG, WEB3_ERRORS, STORAGE_KEYS, TxStatus } from '../web3/config';

export interface AuthState {
  isAuthenticated: boolean;
  isVerifying: boolean;
  txHash: string | null;
  txStatus: TxStatus;
  error: string | null;
  authToken: string | null;
}

export interface UseAuthReturn extends AuthState {
  verifyAndAuthenticate: (address: string) => Promise<boolean>;
  logout: () => void;
  checkAuthentication: () => boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isVerifying: false,
  txHash: null,
  txStatus: TxStatus.IDLE,
  error: null,
  authToken: null,
};

/**
 * Hook for PLEX token authentication
 */
export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>(() => {
    // Check localStorage for existing auth
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const expiry = localStorage.getItem(STORAGE_KEYS.AUTH_EXPIRY);

      if (token && expiry) {
        const expiryDate = new Date(expiry);
        const now = new Date();

        if (expiryDate > now) {
          return {
            ...initialState,
            isAuthenticated: true,
            authToken: token,
          };
        }
      }
    }

    return initialState;
  });

  /**
   * Check if user is authenticated
   */
  const checkAuthentication = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;

    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const expiry = localStorage.getItem(STORAGE_KEYS.AUTH_EXPIRY);

    if (!token || !expiry) return false;

    const expiryDate = new Date(expiry);
    const now = new Date();

    return expiryDate > now;
  }, []);

  /**
   * Generate JWT-like token (simplified for MVP)
   */
  const generateAuthToken = (address: string, txHash: string): string => {
    const payload = {
      address,
      txHash,
      timestamp: Date.now(),
    };

    // In production, this should be done on backend with proper JWT
    return btoa(JSON.stringify(payload));
  };

  /**
   * Verify PLEX balance and send verification transaction
   */
  const verifyAndAuthenticate = useCallback(
    async (address: string): Promise<boolean> => {
      setState((prev) => ({
        ...prev,
        isVerifying: true,
        error: null,
        txStatus: TxStatus.IDLE,
      }));

      try {
        // Step 1: Check PLEX balance
        const hasBalance = await plexContract.hasRequiredBalance(address);

        if (!hasBalance) {
          setState((prev) => ({
            ...prev,
            isVerifying: false,
            error: WEB3_ERRORS.INSUFFICIENT_PLEX,
          }));
          return false;
        }

        // Step 2: Send verification transaction
        setState((prev) => ({
          ...prev,
          txStatus: TxStatus.PENDING,
        }));

        const txHash = await plexContract.sendVerificationTransaction();

        setState((prev) => ({
          ...prev,
          txHash,
        }));

        // Step 3: Wait for confirmation
        const isVerified = await plexContract.verifyTransaction(txHash);

        if (!isVerified) {
          setState((prev) => ({
            ...prev,
            isVerifying: false,
            txStatus: TxStatus.FAILED,
            error: WEB3_ERRORS.TRANSACTION_FAILED,
          }));
          return false;
        }

        // Step 4: Generate auth token
        const authToken = generateAuthToken(address, txHash);
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 24); // 24 hour expiry

        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, authToken);
          localStorage.setItem(
            STORAGE_KEYS.AUTH_EXPIRY,
            expiryDate.toISOString()
          );
        }

        setState({
          isAuthenticated: true,
          isVerifying: false,
          txHash,
          txStatus: TxStatus.SUCCESS,
          error: null,
          authToken,
        });

        return true;
      } catch (error: any) {
        console.error('Error during authentication:', error);

        let errorMessage = 'Ошибка авторизации';
        if (error.code === 4001) {
          errorMessage = WEB3_ERRORS.USER_REJECTED;
        } else if (error.message) {
          errorMessage = error.message;
        }

        setState((prev) => ({
          ...prev,
          isVerifying: false,
          txStatus: TxStatus.FAILED,
          error: errorMessage,
        }));

        return false;
      }
    },
    []
  );

  /**
   * Logout and clear authentication
   */
  const logout = useCallback(() => {
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.AUTH_EXPIRY);
    }

    setState(initialState);
  }, []);

  return {
    ...state,
    verifyAndAuthenticate,
    logout,
    checkAuthentication,
  };
}
