import { ethers } from 'ethers';
import { web3Provider } from '../provider';
import { WEB3_CONFIG } from '../config';

// ERC-20 ABI (только нужные методы)
const PLEX_ABI = [
  // Read functions
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function totalSupply() view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  
  // Write functions
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  
  // Events
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
];

/**
 * PLEX Token Contract Interface
 */
export class PlexContract {
  private contract: ethers.Contract | null = null;
  private readonly address: string;

  constructor(address?: string) {
    this.address = address || WEB3_CONFIG.contracts.PLEX;
  }

  /**
   * Get contract instance
   */
  private async getContract(): Promise<ethers.Contract> {
    if (this.contract) {
      return this.contract;
    }

    const provider = await web3Provider.getProvider();
    this.contract = new ethers.Contract(this.address, PLEX_ABI, provider);
    return this.contract;
  }

  /**
   * Get contract instance with signer
   */
  private async getContractWithSigner(): Promise<ethers.Contract> {
    const signer = await web3Provider.getSigner();
    return new ethers.Contract(this.address, PLEX_ABI, signer);
  }

  /**
   * Get token name
   */
  async getName(): Promise<string> {
    const contract = await this.getContract();
    return await contract.name();
  }

  /**
   * Get token symbol
   */
  async getSymbol(): Promise<string> {
    const contract = await this.getContract();
    return await contract.symbol();
  }

  /**
   * Get token decimals
   */
  async getDecimals(): Promise<number> {
    const contract = await this.getContract();
    return await contract.decimals();
  }

  /**
   * Get total supply
   */
  async getTotalSupply(): Promise<string> {
    const contract = await this.getContract();
    const decimals = await this.getDecimals();
    const supply = await contract.totalSupply();
    return ethers.formatUnits(supply, decimals);
  }

  /**
   * Get balance of address
   */
  async balanceOf(address: string): Promise<string> {
    const contract = await this.getContract();
    const decimals = await this.getDecimals();
    const balance = await contract.balanceOf(address);
    return ethers.formatUnits(balance, decimals);
  }

  /**
   * Check if address has required PLEX amount
   */
  async hasRequiredBalance(
    address: string,
    required: string = WEB3_CONFIG.requiredPlexAmount
  ): Promise<boolean> {
    const balance = await this.balanceOf(address);
    return parseFloat(balance) >= parseFloat(required);
  }

  /**
   * Get allowance
   */
  async allowance(owner: string, spender: string): Promise<string> {
    const contract = await this.getContract();
    const decimals = await this.getDecimals();
    const allowance = await contract.allowance(owner, spender);
    return ethers.formatUnits(allowance, decimals);
  }

  /**
   * Approve spender
   */
  async approve(spender: string, amount: string): Promise<string> {
    const contract = await this.getContractWithSigner();
    const decimals = await this.getDecimals();
    const amountWei = ethers.parseUnits(amount, decimals);
    
    const tx = await contract.approve(spender, amountWei);
    await tx.wait();
    
    return tx.hash;
  }

  /**
   * Transfer tokens
   */
  async transfer(to: string, amount: string): Promise<string> {
    const contract = await this.getContractWithSigner();
    const decimals = await this.getDecimals();
    const amountWei = ethers.parseUnits(amount, decimals);
    
    const tx = await contract.transfer(to, amountWei);
    await tx.wait();
    
    return tx.hash;
  }

  /**
   * Send verification transaction (1 PLEX to AUTH address)
   */
  async sendVerificationTransaction(): Promise<string> {
    const authAddress = WEB3_CONFIG.contracts.AUTH;
    const amount = WEB3_CONFIG.requiredPlexAmount;
    
    return await this.transfer(authAddress, amount);
  }

  /**
   * Verify transaction on-chain
   */
  async verifyTransaction(txHash: string): Promise<boolean> {
    try {
      const receipt = await web3Provider.waitForTransaction(txHash);
      
      if (!receipt) {
        return false;
      }

      // Check if transaction was successful
      if (receipt.status !== 1) {
        return false;
      }

      // Parse logs to verify Transfer event
      const contract = await this.getContract();
      const logs = receipt.logs;

      for (const log of logs) {
        try {
          const parsed = contract.interface.parseLog({
            topics: log.topics as string[],
            data: log.data,
          });

          if (parsed && parsed.name === 'Transfer') {
            const to = parsed.args[1].toLowerCase();
            const authAddress = WEB3_CONFIG.contracts.AUTH.toLowerCase();
            
            // Verify recipient is AUTH address
            if (to === authAddress) {
              return true;
            }
          }
        } catch {
          continue;
        }
      }

      return false;
    } catch (error) {
      console.error('Error verifying transaction:', error);
      return false;
    }
  }
}

// Singleton instance
export const plexContract = new PlexContract();
