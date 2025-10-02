import { WalletService } from './wallet.service';
export declare class WalletController {
    private readonly walletService;
    constructor(walletService: WalletService);
    generateWallet(): Promise<import("./wallet.service").WalletData>;
    decryptMnemonic(encryptedData: string, password: string): Promise<string>;
    validateAddress(address: string): Promise<{
        address: string;
        isValid: boolean;
    }>;
    getCurrentNetwork(): Promise<{
        network: import("./wallet.service").Network;
        isMainnet: boolean;
    }>;
    convertAdaToLovelaces(ada: number): Promise<{
        ada: number;
        lovelaces: number;
    }>;
    convertLovelacesToAda(lovelaces: number): Promise<{
        lovelaces: number;
        ada: number;
    }>;
}
