import { OnModuleInit } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
export declare class SupabaseService implements OnModuleInit {
    private supabase;
    private readonly logger;
    constructor();
    onModuleInit(): void;
    getClient(): SupabaseClient<any, "public", "public", any, any>;
    createUser(userData: {
        email: string;
        password: string;
        username: string;
        firstName: string;
        lastName: string;
        walletAddress: string;
        rewardAddress: string;
        encryptedMnemonic: string;
    }): Promise<{
        user: any;
        profile: any;
    }>;
    getUserByEmail(email: string): Promise<import("@supabase/supabase-js").AuthUser>;
    getUserProfile(userId: string): Promise<any>;
    createWasteSubmission(data: any): Promise<any>;
    getUserSubmissions(userId: string): Promise<any[]>;
    getBinByQR(qrCode: string): Promise<any>;
    getAllActiveBins(): Promise<any[]>;
    createPointTransaction(data: any): Promise<any>;
    getUserTransactions(userId: string): Promise<any[]>;
    getUserTotalPoints(userId: string): Promise<any>;
    updateSubmissionWithBlockchainHash(submissionId: string, hash: string): Promise<null>;
    updateTransactionWithBlockchainHash(transactionId: string, hash: string): Promise<null>;
}
