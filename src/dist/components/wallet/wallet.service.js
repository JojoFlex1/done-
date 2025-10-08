"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WalletService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const config_service_1 = require("../../config/config.service");
const supabase_service_1 = require("../../supabase/supabase.service");
const crypto = __importStar(require("crypto"));
const lucid_1 = require("@lucid-evolution/lucid");
let WalletService = WalletService_1 = class WalletService {
    constructor(configService, supabaseService) {
        this.configService = configService;
        this.supabaseService = supabaseService;
        this.logger = new common_1.Logger(WalletService_1.name);
    }
    async generateAndSaveWallet(userId) {
        try {
            const supabase = this.supabaseService.getClient();
            const { data: existingProfile } = await supabase
                .from('profile')
                .select('wallet_address')
                .eq('id', userId)
                .single();
            if (existingProfile?.wallet_address) {
                throw new common_1.BadRequestException('User already has a wallet');
            }
            const mnemonic = (0, lucid_1.generateSeedPhrase)();
            const network = this.getCurrentNetwork();
            this.logger.log(`🔑 Generating wallet for user ${userId}`);
            this.logger.log(`📝 Mnemonic: ${mnemonic.substring(0, 50)}... (${mnemonic.split(' ').length} words)`);
            const wallet = (0, lucid_1.walletFromSeed)(mnemonic, {
                network: network === 'Mainnet' ? 'Mainnet' : network
            });
            this.logger.log(`📍 Address: ${wallet.address}`);
            const encryptedMnemonic = this.encryptMnemonic(mnemonic, this.configService.encryption.key);
            this.logger.log(`🔐 Encrypted mnemonic: ${encryptedMnemonic.substring(0, 50)}...`);
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
                throw new common_1.BadRequestException('Failed to save wallet to profile');
            }
            this.logger.log(`✅ Wallet saved for user ${userId}`);
            return {
                address: wallet.address,
                rewardAddress: wallet.rewardAddress,
                mnemonic,
            };
        }
        catch (error) {
            this.logger.error('generateAndSaveWallet error:', error);
            throw error;
        }
    }
    async getUserWallet(userId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('profile')
            .select('wallet_address, reward_address')
            .eq('id', userId)
            .single();
        if (error || !data?.wallet_address) {
            throw new common_1.BadRequestException('No wallet found for this user');
        }
        return {
            address: data.wallet_address,
            rewardAddress: data.reward_address,
        };
    }
    async getWalletWithKeys(userId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('profile')
            .select('encrypted_mnemonic')
            .eq('id', userId)
            .single();
        if (error || !data?.encrypted_mnemonic) {
            throw new common_1.BadRequestException('Wallet not found');
        }
        const mnemonic = this.decryptMnemonic(data.encrypted_mnemonic, this.configService.encryption.key);
        return this.restoreWallet(mnemonic);
    }
    getTreasuryWallet() {
        const treasuryMnemonic = this.configService.treasury.mnemonic;
        if (!treasuryMnemonic) {
            throw new Error('Treasury mnemonic not configured');
        }
        this.logger.log('Loading treasury wallet');
        return this.restoreWallet(treasuryMnemonic);
    }
    generateWallet() {
        try {
            const mnemonic = (0, lucid_1.generateSeedPhrase)();
            const network = this.getCurrentNetwork();
            const wallet = (0, lucid_1.walletFromSeed)(mnemonic, {
                network: network === 'Mainnet' ? 'Mainnet' : network
            });
            const encryptedMnemonic = this.encryptMnemonic(mnemonic, this.configService.encryption.key);
            this.logger.log(`Generated test wallet: ${wallet.address.substring(0, 30)}...`);
            return {
                address: wallet.address,
                rewardAddress: wallet.rewardAddress,
                paymentKey: wallet.paymentKey,
                stakeKey: wallet.stakeKey,
                mnemonic,
                encryptedMnemonic,
            };
        }
        catch (error) {
            this.logger.error('Failed to generate wallet:', error);
            throw new Error(`Wallet generation failed: ${error.message}`);
        }
    }
    restoreWallet(mnemonic) {
        try {
            const network = this.getCurrentNetwork();
            const wallet = (0, lucid_1.walletFromSeed)(mnemonic, {
                network: network === 'Mainnet' ? 'Mainnet' : network
            });
            return {
                address: wallet.address,
                rewardAddress: wallet.rewardAddress,
                paymentKey: wallet.paymentKey,
                stakeKey: wallet.stakeKey,
                mnemonic,
            };
        }
        catch (error) {
            this.logger.error('Failed to restore wallet:', error);
            throw new Error(`Wallet restoration failed: ${error.message}`);
        }
    }
    decryptMnemonic(encryptedData, password) {
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
        }
        catch (error) {
            throw new Error(`Decryption failed: ${error.message}`);
        }
    }
    encryptMnemonic(mnemonic, password) {
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
        }
        catch (error) {
            throw new Error(`Encryption failed: ${error.message}`);
        }
    }
    lovelacesToAda(lovelaces) {
        return lovelaces / 1000000;
    }
    adaToLovelaces(ada) {
        return Math.round(ada * 1000000);
    }
    getCurrentNetwork() {
        return this.configService.cardano.network;
    }
    isMainnet() {
        return this.getCurrentNetwork() === 'Mainnet';
    }
    validateAddress(address) {
        if (!address)
            return false;
        const isMainnet = address.startsWith('addr1');
        const isTestnet = address.startsWith('addr_test1');
        const validLength = address.length >= 100 && address.length <= 115;
        return (isMainnet || isTestnet) && validLength;
    }
    validateMnemonic(mnemonic) {
        const words = mnemonic.trim().split(/\s+/);
        const validLengths = [12, 15, 18, 21, 24];
        return validLengths.includes(words.length);
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = WalletService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService,
        supabase_service_1.SupabaseService])
], WalletService);
//# sourceMappingURL=wallet.service.js.map