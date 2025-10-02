import { RewardsService } from './rewards.service';
export declare class RewardsController {
    private rewardsService;
    constructor(rewardsService: RewardsService);
    getRewardHistory(req: any): Promise<{
        id: any;
        points: any;
        ada_amount: number;
        transaction_type: any;
        description: any;
        blockchain_hash: any;
        created_at: any;
        status: string;
    }[]>;
    getTotalRewards(req: any): Promise<{
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
