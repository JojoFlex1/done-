import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { WalletService } from '../components/wallet/wallet.service';

@Injectable()
export class RewardsService {
  private readonly logger = new Logger(RewardsService.name);

  constructor(
    private supabaseService: SupabaseService,
    private walletService: WalletService,
  ) {}

  async processReward(userId: string, points: number, submissionId: string) {
    try {
      const profile = await this.supabaseService.getUserProfile(userId);
      if (!profile?.wallet_address) {
        throw new Error('Wallet address not found');
      }

      const adaAmount = this.walletService.lovelacesToAda(points);
      
      // For now: Create transaction record without blockchain
      // We'll add real blockchain in next step
      const txHash = `pending_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await this.supabaseService.updateSubmissionWithBlockchainHash(submissionId, txHash);
      
      this.logger.log(`💰 Reward processed: ${adaAmount} ADA for ${profile.wallet_address.substring(0, 20)}...`);
      
      return {
        success: true,
        adaAmount,
        txHash,
        walletAddress: profile.wallet_address,
      };
    } catch (error) {
      this.logger.error('Reward processing failed:', error);
      throw error;
    }
  }

  async getUserRewardHistory(userId: string) {
    try {
      const transactions = await this.supabaseService.getUserTransactions(userId);

      return transactions.map(transaction => ({
        id: transaction.id,
        points: transaction.points,
        ada_amount: this.walletService.lovelacesToAda(transaction.points),
        transaction_type: transaction.transaction_type,
        description: transaction.description,
        blockchain_hash: transaction.blockchain_hash,
        created_at: transaction.created_at,
        status: transaction.blockchain_hash && !transaction.blockchain_hash.startsWith('pending') 
          ? 'confirmed' 
          : 'pending',
      }));
    } catch (error) {
      throw new Error('Failed to get reward history');
    }
  }

  async getUserTotalRewards(userId: string) {
    try {
      const profile = await this.supabaseService.getUserProfile(userId);
      const transactions = await this.supabaseService.getUserTransactions(userId);

      const totalEarned = transactions
        .filter(t => t.transaction_type === 'earned')
        .reduce((sum, t) => sum + t.points, 0);

      return {
        wallet_address: profile.wallet_address,
        network: this.walletService.getCurrentNetwork(),
        totals: {
          points_earned: totalEarned,
          ada_earned: this.walletService.lovelacesToAda(totalEarned),
        },
        statistics: {
          total_submissions: transactions.filter(t => t.transaction_type === 'earned').length,
          total_transactions: transactions.length,
        },
      };
    } catch (error) {
      throw new Error('Failed to get total rewards');
    }
  }
}
