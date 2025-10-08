import { ConfigService } from '../../config/config.service';
import { SupabaseService } from '../../supabase/supabase.service';
export type Network = 'Mainnet' | 'Preprod' | 'Preview';
export interface WalletData {
    address: string;
    rewardAddress: string;
    paymentKey: string;
    stakeKey: string;
    mnemonic: string;
    encryptedMnemonic: string;
}
export declare class WalletService {
    private configService;
    private supabaseService;
    private readonly logger;
    constructor(configService: ConfigService, supabaseService: SupabaseService);
    generateAndSaveWallet(userId: string): Promise<{
        address: string;
        rewardAddress: string;
        mnemonic: string;
    }>;
    getUserWallet(userId: string): Promise<{
        address: string;
        rewardAddress: string;
    }>;
    getWalletWithKeys(userId: string): Promise<Omit<WalletData, 'encryptedMnemonic'>>;
    getTreasuryWallet(): Omit<WalletData, 'encryptedMnemonic'>;
    generateWallet(): WalletData;
    restoreWallet(mnemonic: string): Omit<WalletData, 'encryptedMnemonic'>;
    decryptMnemonic(encryptedData: string, password: string): string;
    private encryptMnemonic;
    lovelacesToAda(lovelaces: number): number;
    adaToLovelaces(ada: number): number;
    getCurrentNetwork(): Network;
    isMainnet(): boolean;
    validateAddress(address: string): boolean;
    validateMnemonic(mnemonic: string): boolean;
}
