import { SupabaseService } from '../supabase/supabase.service';
import { WalletService } from '../components/wallet/wallet.service';
export declare class RewardsService {
    private supabaseService;
    private walletService;
    private readonly logger;
    constructor(supabaseService: SupabaseService, walletService: WalletService);
    processReward(userId: string, points: number, submissionId: string): Promise<{
        success: boolean;
        adaAmount: number;
        txHash: string;
        walletAddress: any;
    }>;
    getUserRewardHistory(userId: string): Promise<{
        id: any;
        points: any;
        ada_amount: number;
        transaction_type: any;
        description: any;
        blockchain_hash: any;
        created_at: any;
        status: string;
    }[]>;
    getUserTotalRewards(userId: string): Promise<{
        wallet_address: any;
        network: import("../components/wallet/wallet.service").Network;
        totals: {
            points_earned: any;
            ada_earned: number;
        };
        statistics: {
            total_submissions: number;
            total_transactions: number;
        };
    }>;
}
