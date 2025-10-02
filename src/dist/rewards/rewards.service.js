"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RewardsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewardsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
const wallet_service_1 = require("../components/wallet/wallet.service");
let RewardsService = RewardsService_1 = class RewardsService {
    constructor(supabaseService, walletService) {
        this.supabaseService = supabaseService;
        this.walletService = walletService;
        this.logger = new common_1.Logger(RewardsService_1.name);
    }
    async processReward(userId, points, submissionId) {
        try {
            const profile = await this.supabaseService.getUserProfile(userId);
            if (!profile?.wallet_address) {
                throw new Error('Wallet address not found');
            }
            const adaAmount = this.walletService.lovelacesToAda(points);
            const mockTxHash = `mock_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await this.supabaseService.updateSubmissionWithBlockchainHash(submissionId, mockTxHash);
            this.logger.log(`[MOCK] Sent ${adaAmount} ADA to ${profile.wallet_address.substring(0, 20)}...`);
            return {
                success: true,
                adaAmount,
                txHash: mockTxHash,
                walletAddress: profile.wallet_address,
            };
        }
        catch (error) {
            this.logger.error('Reward processing failed:', error);
            throw error;
        }
    }
    async getUserRewardHistory(userId) {
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
                status: transaction.blockchain_hash ? 'confirmed' : 'pending',
            }));
        }
        catch (error) {
            throw new Error('Failed to get reward history');
        }
    }
    async getUserTotalRewards(userId) {
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
        }
        catch (error) {
            throw new Error('Failed to get total rewards');
        }
    }
};
exports.RewardsService = RewardsService;
exports.RewardsService = RewardsService = RewardsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        wallet_service_1.WalletService])
], RewardsService);
//# sourceMappingURL=rewards.service.js.map