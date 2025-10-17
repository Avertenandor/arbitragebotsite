import { ethers } from 'ethers';
import { WEB3_CONFIG, WEB3_ERRORS } from './config';

/**
 * Web3 Provider Manager
 * Manages ethers.js provider and signer instances
 */
class Web3Provider {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  /**
   * Get or create browser provider
   */
  async getProvider(): Promise<ethers.BrowserProvider> {
    if (this.provider) {
      return this.provider;
    }

    if (typeof window === 'undefined') {
      throw new Error('Window is not defined');
    }

    if (!window.ethereum) {
      throw new Error(WEB3_ERRORS.NO_PROVIDER);
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    return this.provider;
  }

  /**
   * Get signer (connected wallet)
   */
  async getSigner(): Promise<ethers.JsonRpcSigner> {
    if (this.signer) {
      return this.signer;
    }

    const provider = await this.getProvider();
    this.signer = await provider.getSigner();
    return this.signer;
  }

  /**
   * Get connected wallet address
   */
  async getAddress(): Promise<string> {
    const signer = await this.getSigner();
    return await signer.getAddress();
  }

  /**
   * Get current network chain ID
   */
  async getChainId(): Promise<number> {
    const provider = await this.getProvider();
    const network = await provider.getNetwork();
    return Number(network.chainId);
  }

  /**
   * Check if connected to BSC
   */
  async isCorrectNetwork(): Promise<boolean> {
    try {
      const chainId = await this.getChainId();
      return chainId === WEB3_CONFIG.chainId;
    } catch {
      return false;
    }
  }

  /**
   * Switch to BSC network
   */
  async switchNetwork(): Promise<void> {
    if (!window.ethereum) {
      throw new Error(WEB3_ERRORS.NO_PROVIDER);
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [
          {
            chainId: `0x${WEB3_CONFIG.chainId.toString(16)}`,
          },
        ],
      });
    } catch (error: any) {
      // Chain not added yet
      if (error.code === 4902) {
        await this.addNetwork();
      } else {
        throw error;
      }
    }
  }

  /**
   * Add BSC network to wallet
   */
  async addNetwork(): Promise<void> {
    if (!window.ethereum) {
      throw new Error(WEB3_ERRORS.NO_PROVIDER);
    }

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: `0x${WEB3_CONFIG.chainId.toString(16)}`,
          chainName: WEB3_CONFIG.chainName,
          nativeCurrency: WEB3_CONFIG.nativeCurrency,
          rpcUrls: [WEB3_CONFIG.rpcUrls.primary],
          blockExplorerUrls: WEB3_CONFIG.blockExplorerUrls,
        },
      ],
    });
  }

  /**
   * Get balance in BNB
   */
  async getBalance(address: string): Promise<string> {
    const provider = await this.getProvider();
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  /**
   * Wait for transaction receipt
   */
  async waitForTransaction(
    txHash: string,
    confirmations: number = WEB3_CONFIG.confirmations
  ): Promise<ethers.TransactionReceipt | null> {
    const provider = await this.getProvider();
    return await provider.waitForTransaction(txHash, confirmations);
  }

  /**
   * Reset provider and signer
   */
  reset(): void {
    this.provider = null;
    this.signer = null;
  }
}

// Singleton instance
export const web3Provider = new Web3Provider();

// Helper functions
export async function connectWallet(): Promise<string> {
  if (!window.ethereum) {
    throw new Error(WEB3_ERRORS.NO_PROVIDER);
  }

  // Request account access
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });

  if (!accounts || accounts.length === 0) {
    throw new Error(WEB3_ERRORS.USER_REJECTED);
  }

  return accounts[0];
}

export async function disconnectWallet(): Promise<void> {
  web3Provider.reset();
  
  // Clear local storage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('walletConnected');
  }
}

// Type augmentation for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: {
        method: string;
        params?: any[];
      }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (
        event: string,
        callback: (...args: any[]) => void
      ) => void;
      isMetaMask?: boolean;
      isTrust?: boolean;
      isBinance?: boolean;
    };
  }
}

export { WEB3_CONFIG };
