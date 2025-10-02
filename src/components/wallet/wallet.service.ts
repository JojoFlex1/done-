import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import * as crypto from 'crypto';
import { generateSeedPhrase, walletFromSeed } from '@lucid-evolution/lucid';

export type Network = 'Mainnet' | 'Preprod' | 'Preview';

export interface WalletData {
  address: string;
  rewardAddress: string;
  paymentKey: string;
  stakeKey: string;
  mnemonic: string;
  encryptedMnemonic: string;
}

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(private configService: ConfigService) {}

  generateWallet(): WalletData {
    try {
      const mnemonic = generateSeedPhrase();
      const network = this.getCurrentNetwork();
      
      const wallet = walletFromSeed(mnemonic, { 
        network: network === 'Mainnet' ? 'Mainnet' : network 
      });
      
      const encryptedMnemonic = this.encryptMnemonic(
        mnemonic,
        this.configService.encryption.key
      );
      
      this.logger.log(`Generated Cardano wallet: ${wallet.address.substring(0, 20)}...`);
      
      return {
        address: wallet.address,
        rewardAddress: wallet.rewardAddress,
        paymentKey: wallet.paymentKey,
        stakeKey: wallet.stakeKey,
        mnemonic,
        encryptedMnemonic,
      };
    } catch (error) {
      this.logger.error('Failed to generate wallet:', error);
      throw new Error(`Wallet generation failed: ${error.message}`);
    }
  }

  restoreWallet(mnemonic: string): Omit<WalletData, 'encryptedMnemonic'> {
    try {
      const network = this.getCurrentNetwork();
      
      const wallet = walletFromSeed(mnemonic, { 
        network: network === 'Mainnet' ? 'Mainnet' : network 
      });
      
      return {
        address: wallet.address,
        rewardAddress: wallet.rewardAddress,
        paymentKey: wallet.paymentKey,
        stakeKey: wallet.stakeKey,
        mnemonic,
      };
    } catch (error) {
      this.logger.error('Failed to restore wallet:', error);
      throw new Error(`Wallet restoration failed: ${error.message}`);
    }
  }

  decryptMnemonic(encryptedData: string, password: string): string {
    if (!encryptedData || !password) {
      throw new Error('Encrypted data and password required');
    }

    try {
      const parts = encryptedData.split(':');
      if (parts.length !== 2) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = Buffer.from(parts[1], 'hex');
      const key = crypto.createHash('sha256').update(password).digest();

      const decipher = crypto.createDecipheriv('aes-256-ctr', key, iv);
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]);

      return decrypted.toString();
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  private encryptMnemonic(mnemonic: string, password: string): string {
    if (!mnemonic || !password) {
      throw new Error('Mnemonic and password required');
    }

    try {
      const algorithm = 'aes-256-ctr';
      const iv = crypto.randomBytes(16);
      const key = crypto.createHash('sha256').update(password).digest();

      const cipher = crypto.createCipheriv(algorithm, key, iv);
      const encrypted = Buffer.concat([cipher.update(mnemonic), cipher.final()]);

      return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  lovelacesToAda(lovelaces: number): number {
    return lovelaces / 1000000;
  }

  adaToLovelaces(ada: number): number {
    return Math.round(ada * 1000000);
  }

  getCurrentNetwork(): Network {
    return this.configService.cardano.network as Network;
  }

  isMainnet(): boolean {
    return this.getCurrentNetwork() === 'Mainnet';
  }

  validateAddress(address: string): boolean {
    if (!address) return false;
    
    const isMainnet = address.startsWith('addr1');
    const isTestnet = address.startsWith('addr_test1');
    const validLength = address.length >= 100 && address.length <= 115;
    
    return (isMainnet || isTestnet) && validLength;
  }

  validateMnemonic(mnemonic: string): boolean {
    const words = mnemonic.trim().split(/\s+/);
    const validLengths = [12, 15, 18, 21, 24];
    return validLengths.includes(words.length);
  }
}
