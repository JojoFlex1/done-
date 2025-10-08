import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import { SupabaseService } from '../../supabase/supabase.service';
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

  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {}

  /**
   * Generate UNIQUE wallet for user and save to profile table
   */
  async generateAndSaveWallet(userId: string): Promise<{ address: string; rewardAddress: string; mnemonic: string }> {
    try {
      const supabase = this.supabaseService.getClient();
      const { data: existingProfile } = await supabase
        .from('profile')
        .select('wallet_address')
        .eq('id', userId)
        .single();

      if (existingProfile?.wallet_address) {
        throw new BadRequestException('User already has a wallet');
      }

      // Generate NEW 24-word mnemonic
      const mnemonic = generateSeedPhrase();
      const network = this.getCurrentNetwork();
      
      this.logger.log(`🔑 Generating wallet for user ${userId}`);
      this.logger.log(`📝 Mnemonic: ${mnemonic.substring(0, 50)}... (${mnemonic.split(' ').length} words)`);
      
      const wallet = walletFromSeed(mnemonic, { 
        network: network === 'Mainnet' ? 'Mainnet' : network 
      });
      
      this.logger.log(`📍 Address: ${wallet.address}`);

      // Encrypt mnemonic before storing
      const encryptedMnemonic = this.encryptMnemonic(
        mnemonic,
        this.configService.encryption.key
      );
      
      this.logger.log(`🔐 Encrypted mnemonic: ${encryptedMnemonic.substring(0, 50)}...`);
      
      // Save to profile table
      const { error } = await supabase
        .from('profile')
        .update({
          wallet_address: wallet.address,
          reward_address: wallet.rewardAddress,
          encrypted_mnemonic: encryptedMnemonic,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        this.logger.error('❌ Failed to save wallet:', error);
        throw new BadRequestException('Failed to save wallet to profile');
      }

      this.logger.log(`✅ Wallet saved for user ${userId}`);

      // IMPORTANT: Return PLAIN mnemonic, not encrypted!
      return {
        address: wallet.address,
        rewardAddress: wallet.rewardAddress,
        mnemonic, // <-- This is the 24-word phrase
      };
    } catch (error) {
      this.logger.error('generateAndSaveWallet error:', error);
      throw error;
    }
  }

  /**
   * Get user's wallet (NO MNEMONIC - safe for UI)
   */
  async getUserWallet(userId: string): Promise<{ address: string; rewardAddress: string }> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('profile')
      .select('wallet_address, reward_address')
      .eq('id', userId)
      .single();

    if (error || !data?.wallet_address) {
      throw new BadRequestException('No wallet found for this user');
    }

    return {
      address: data.wallet_address,
      rewardAddress: data.reward_address,
    };
  }

  /**
   * Get wallet with keys for signing (INTERNAL USE ONLY!)
   */
  async getWalletWithKeys(userId: string): Promise<Omit<WalletData, 'encryptedMnemonic'>> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('profile')
      .select('encrypted_mnemonic')
      .eq('id', userId)
      .single();

    if (error || !data?.encrypted_mnemonic) {
      throw new BadRequestException('Wallet not found');
    }

    const mnemonic = this.decryptMnemonic(
      data.encrypted_mnemonic,
      this.configService.encryption.key,
    );

    return this.restoreWallet(mnemonic);
  }

  /**
   * Get Treasury wallet (for admin operations)
   */
  getTreasuryWallet(): Omit<WalletData, 'encryptedMnemonic'> {
    const treasuryMnemonic = this.configService.treasury.mnemonic;
    
    if (!treasuryMnemonic) {
      throw new Error('Treasury mnemonic not configured');
    }

    this.logger.log('Loading treasury wallet');
    return this.restoreWallet(treasuryMnemonic);
  }

  /**
   * Generate test wallet (doesn't save)
   */
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
      
      this.logger.log(`Generated test wallet: ${wallet.address.substring(0, 30)}...`);
      
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
