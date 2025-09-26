// ================================================================
// src/rewards/rewards.module.ts
// ================================================================
import { Module } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { RewardsController } from './rewards.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { WalletModule } from '../wallet/wallet.module';
import { ConfigService } from '../config/config.service';

@Module({
  imports: [SupabaseModule, WalletModule],
  controllers: [RewardsController],
  providers: [RewardsService, ConfigService],
  exports: [RewardsService],
})
export class RewardsModule {}

// ================================================================
// src/rewards/rewards.service.ts - ADA Reward Processing
// ================================================================
import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { WalletService } from '../wallet/wallet.service';
import { ConfigService } from '../config/config.service';

@Injectable()
export class RewardsService {
  private readonly logger = new Logger(RewardsService.name);

  constructor(
    private supabaseService: SupabaseService,
    private walletService: WalletService,
    private configService: ConfigService,
  ) {}

  /**
   * Process ADA reward for waste submission
   * This is where blockchain integration happens
   */
  async processReward(userId: string, points: number, submissionId: string) {
    try {
      this.logger.log(`Processing ${points} point reward for user ${userId}`);

      // Get user profile with wallet info
      const profile = await this.supabaseService.getUserProfile(userId);
      if (!profile?.wallet_address) {
        throw new Error('User wallet address not found');
      }

      // Convert points to ADA (points are in lovelaces)
      const adaAmount = this.walletService.lovelacesToAda(points);
      
      this.logger.log(
        `Sending ${adaAmount} ADA (${points} lovelaces) to ${profile.wallet_address.substring(0, 20)}...`
      );

      // TODO: Implement actual Cardano blockchain transaction
      // This is where you'd integrate with your smart contract
      const blockchainResult = await this.sendADAReward(
        profile.wallet_address,
        points,
        profile.encrypted_mnemonic
      );

      // Update submission with blockchain transaction hash
      if (blockchainResult.txHash) {
        await this.supabaseService.updateSubmissionWithBlockchainHash(
          submissionId,
          blockchainResult.txHash
        );

        // Also update the point transaction
        const transactions = await this.supabaseService.getUserTransactions(userId);
        const relatedTransaction = transactions.find(t => t.submission_id === submissionId);
        
        if (relatedTransaction) {
          await this.supabaseService.updateTransactionWithBlockchainHash(
            relatedTransaction.id,
            blockchainResult.txHash
          );
        }
      }

      this.logger.log(`Reward processed successfully: ${blockchainResult.txHash}`);

      return {
        success: true,
        adaAmount,
        txHash: blockchainResult.txHash,
        walletAddress: profile.wallet_address,
        network: this.walletService.getCurrentNetwork(),
      };
    } catch (error) {
      this.logger.error(`Failed to process reward: ${error.message}`);
      
      // In production, you might want to queue failed rewards for retry
      this.logger.error(`Reward will be processed manually: User ${userId}, Points ${points}`);
      
      throw error;
    }
  }

  /**
   * Get user's complete reward history
   */
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
        waste_info: transaction.waste_submissions ? {
          waste_type: transaction.waste_submissions.waste_type,
          bin_name: transaction.waste_submissions.bins?.name,
        } : null,
        status: transaction.blockchain_hash ? 'confirmed' : 'pending',
      }));
    } catch (error) {
      this.logger.error('Failed to get reward history:', error);
      throw new Error('Failed to retrieve reward history');
    }
  }

  /**
   * Get user's total rewards summary
   */
  async getUserTotalRewards(userId: string) {
    try {
      const profile = await this.supabaseService.getUserProfile(userId);
      const transactions = await this.supabaseService.getUserTransactions(userId);

      const earnedTransactions = transactions.filter(t => t.transaction_type === 'earned');
      const redeemedTransactions = transactions.filter(t => t.transaction_type === 'redeemed');
      const confirmedTransactions = transactions.filter(t => t.blockchain_hash);

      const totalEarned = earnedTransactions.reduce((sum, t) => sum + t.points, 0);
      const totalRedeemed = redeemedTransactions.reduce((sum, t) => sum + t.points, 0);
      const totalConfirmed = confirmedTransactions.reduce((sum, t) => sum + t.points, 0);
      const pendingConfirmation = transactions
        .filter(t => !t.blockchain_hash && t.transaction_type === 'earned')
        .reduce((sum, t) => sum + t.points, 0);

      return {
        wallet_address: profile.wallet_address,
        network: this.walletService.getCurrentNetwork(),
        totals: {
          points_earned: totalEarned,
          points_redeemed: totalRedeemed,
          points_available: totalEarned - totalRedeemed,
          ada_earned: this.walletService.lovelacesToAda(totalEarned),
          ada_redeemed: this.walletService.lovelacesToAda(totalRedeemed),
          ada_available: this.walletService.lovelacesToAda(totalEarned - totalRedeemed),
        },
        blockchain: {
          confirmed_transactions: confirmedTransactions.length,
          pending_confirmation: pendingConfirmation,
          pending_ada: this.walletService.lovelacesToAda(pendingConfirmation),
        },
        statistics: {
          total_submissions: earnedTransactions.length,
          total_transactions: transactions.length,
          first_reward_date: earnedTransactions.length > 0 ? 
            earnedTransactions[earnedTransactions.length - 1].created_at : null,
          last_reward_date: earnedTransactions.length > 0 ? 
            earnedTransactions[0].created_at : null,
        },
      };
    } catch (error) {
      this.logger.error('Failed to get total rewards:', error);
      throw new Error('Failed to retrieve reward totals');
    }
  }

  /**
   * Get reward analytics for admin/insights
   */
  async getRewardAnalytics(userId: string) {
    try {
      const transactions = await this.supabaseService.getUserTransactions(userId);
      const submissions = await this.supabaseService.getUserSubmissions(userId);

      // Group rewards by waste category
      const rewardsByCategory = {};
      const rewardsByMonth = {};

      submissions.forEach(submission => {
        // Group by waste type category (based on your waste categories)
        const wasteType = submission.waste_type;
        let category = 'other';
        
        if (['usb_cable', 'phone_charger', 'laptop_charger', 'hdmi_cable', 'audio_cable'].includes(wasteType)) {
          category = 'cables';
        } else if (['headphones', 'earbuds', 'bluetooth_speaker', 'computer_mouse', 'keyboard', 'remote_control', 'calculator'].includes(wasteType)) {
          category = 'small_electronics';
        } else if (['smartphone', 'basic_phone', 'smartwatch', 'fitness_tracker', 'portable_speaker', 'gaming_controller'].includes(wasteType)) {
          category = 'mobile_devices';
        } else if (['tablet', 'laptop', 'desktop_computer', 'monitor', 'printer'].includes(wasteType)) {
          category = 'large_electronics';
        } else if (wasteType.includes('battery')) {
          category = 'batteries';
        }

        if (!rewardsByCategory[category]) {
          rewardsByCategory[category] = {
            category,
            count: 0,
            total_points: 0,
            total_ada: 0,
          };
        }

        rewardsByCategory[category].count += 1;
        rewardsByCategory[category].total_points += submission.points_earned;
        rewardsByCategory[category].total_ada += this.walletService.lovelacesToAda(submission.points_earned);

        // Group by month
        const monthKey = submission.created_at.substring(0, 7); // YYYY-MM
        if (!rewardsByMonth[monthKey]) {
          rewardsByMonth[monthKey] = {
            month: monthKey,
            submissions: 0,
            points: 0,
            ada: 0,
          };
        }

        rewardsByMonth[monthKey].submissions += 1;
        rewardsByMonth[monthKey].points += submission.points_earned;
        rewardsByMonth[monthKey].ada += this.walletService.lovelacesToAda(submission.points_earned);
      });

      return {
        by_category: Object.values(rewardsByCategory),
        by_month: Object.values(rewardsByMonth).sort((a, b) => a.month.localeCompare(b.month)),
        top_waste_types: this.getTopWasteTypes(submissions),
        recent_activity: submissions.slice(0, 10),
      };
    } catch (error) {
      this.logger.error('Failed to get reward analytics:', error);
      throw new Error('Failed to retrieve analytics');
    }
  }

  /**
   * Mock blockchain transaction - Replace with real implementation
   * This is where you'd integrate with your Cardano smart contract
   */
  private async sendADAReward(
    toAddress: string, 
    lovelaces: number, 
    encryptedMnemonic: string
  ): Promise<{ success: boolean; txHash: string }> {
    
    // TODO: Replace this mock with actual Cardano blockchain integration
    // Example integration would look like:
    /*
    try {
      // 1. Decrypt the treasury wallet mnemonic
      const treasuryMnemonic = this.walletService.decryptMnemonic(
        process.env.TREASURY_ENCRYPTED_MNEMONIC, 
        process.env.TREASURY_PASSWORD
      );
      
      // 2. Create wallet instance
      const treasuryWallet = this.walletService.getWalletFromEncryptedMnemonic(treasuryMnemonic);
      
      // 3. Create transaction using your smart contract
      const tx = await treasuryWallet.submitTx({
        to: toAddress,
        amount: lovelaces,
        // Your smart contract interaction here
      });
      
      // 4. Wait for confirmation
      const confirmed = await treasuryWallet.awaitTx(tx);
      
      return { success: true, txHash: tx };
    } catch (error) {
      throw new Error(`Blockchain transaction failed: ${error.message}`);
    }
    */

    // MOCK IMPLEMENTATION - Remove in production
    if (this.walletService.isMainnet()) {
      this.logger.warn('Mock transactions not allowed on Mainnet!');
      throw new Error('Real blockchain integration required for Mainnet');
    }

    const mockTxHash = `mock_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.logger.log(`[MOCK] Sending ${lovelaces} lovelaces to ${toAddress}`);
    this.logger.log(`[MOCK] Transaction hash: ${mockTxHash}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      txHash: mockTxHash
    };
  }

  /**
   * Helper to get top waste types by submission count
   */
  private getTopWasteTypes(submissions: any[]) {
    const wasteTypeCounts = {};
    
    submissions.forEach(submission => {
      const type = submission.waste_type;
      if (!wasteTypeCounts[type]) {
        wasteTypeCounts[type] = {
          waste_type: type,
          count: 0,
          total_points: 0,
          total_ada: 0,
        };
      }
      wasteTypeCounts[type].count += 1;
      wasteTypeCounts[type].total_points += submission.points_earned;
      wasteTypeCounts[type].total_ada += this.walletService.lovelacesToAda(submission.points_earned);
    });

    return Object.values(wasteTypeCounts)
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 10);
  }
}

// ================================================================
// src/rewards/rewards.controller.ts - Rewards API Controller
// ================================================================
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { RewardsService } from './rewards.service';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('ADA Rewards')
@Controller('rewards')
@UseGuards(AuthGuard)
export class RewardsController {
  constructor(private rewardsService: RewardsService) {}

  @Get('history')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get user\'s ADA reward history',
    description: 'Retrieve all reward transactions with blockchain confirmation status'
  })
  @ApiResponse({ status: 200, description: 'Reward history retrieved successfully' })
  async getRewardHistory(@Request() req) {
    return this.rewardsService.getUserRewardHistory(req.user.sub);
  }

  @Get('total')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get user\'s total ADA rewards summary',
    description: 'Get comprehensive summary of earned, redeemed, and available ADA'
  })
  @ApiResponse({ status: 200, description: 'Reward totals retrieved successfully' })
  async getTotalRewards(@Request() req) {
    return this.rewardsService.getUserTotalRewards(req.user.sub);
  }

  @Get('analytics')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get detailed reward analytics',
    description: 'Get rewards broken down by category, month, and waste types'
  })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getRewardAnalytics(@Request() req) {
    return this.rewardsService.getRewardAnalytics(req.user.sub);
  }
}