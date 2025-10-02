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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const supabase_service_1 = require("../supabase/supabase.service");
const wallet_service_1 = require("./wallet/wallet.service");
const email_service_1 = require("./email.service");
const crypto = __importStar(require("crypto"));
let AuthService = AuthService_1 = class AuthService {
    constructor(supabaseService, walletService, emailService, jwtService) {
        this.supabaseService = supabaseService;
        this.walletService = walletService;
        this.emailService = emailService;
        this.jwtService = jwtService;
        this.logger = new common_1.Logger(AuthService_1.name);
        this.pendingSignups = new Map();
    }
    async signup(signupDto) {
        const { email, username, firstName, lastName } = signupDto;
        try {
            const existingUser = await this.supabaseService.getUserByEmail(email);
            if (existingUser) {
                throw new common_1.BadRequestException('User with this email already exists');
            }
            const password = this.generateSecurePassword();
            this.logger.log('Generating Cardano wallet...');
            const wallet = this.walletService.generateWallet();
            const otp = this.generateOTP();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
            this.pendingSignups.set(email, {
                email,
                username,
                firstName,
                lastName,
                walletAddress: wallet.address,
                rewardAddress: wallet.rewardAddress,
                encryptedMnemonic: wallet.encryptedMnemonic,
                password,
                otp,
                expiresAt,
            });
            await this.emailService.sendOTP(email, otp, firstName);
            this.logger.log(`Signup initiated for ${email}`);
            return {
                message: 'OTP sent to your email',
                walletAddress: wallet.address,
                expiresAt,
            };
        }
        catch (error) {
            this.logger.error('Signup failed:', error);
            throw error;
        }
    }
    async verifyOTP(email, otp) {
        const pendingSignup = this.pendingSignups.get(email);
        if (!pendingSignup) {
            throw new common_1.BadRequestException('No pending signup found for this email');
        }
        if (pendingSignup.expiresAt < new Date()) {
            this.pendingSignups.delete(email);
            throw new common_1.BadRequestException('OTP has expired');
        }
        if (pendingSignup.otp !== otp.trim()) {
            throw new common_1.UnauthorizedException('Invalid OTP');
        }
        try {
            this.logger.log('OTP verified, creating user...');
            const result = await this.supabaseService.createUser({
                email: pendingSignup.email,
                password: pendingSignup.password,
                username: pendingSignup.username,
                firstName: pendingSignup.firstName,
                lastName: pendingSignup.lastName,
                walletAddress: pendingSignup.walletAddress,
                rewardAddress: pendingSignup.rewardAddress,
                encryptedMnemonic: pendingSignup.encryptedMnemonic,
            });
            this.pendingSignups.delete(email);
            const token = this.jwtService.sign({
                sub: result.user.id,
                email: result.user.email,
            });
            this.logger.log(`User created successfully: ${result.user.id}`);
            return {
                message: 'Account created successfully',
                user: {
                    id: result.user.id,
                    email: result.user.email,
                    username: result.profile.username,
                    firstName: result.profile.first_name,
                    lastName: result.profile.last_name,
                    walletAddress: result.profile.wallet_address,
                },
                token,
            };
        }
        catch (error) {
            this.logger.error('User creation failed:', error);
            throw error;
        }
    }
    async resendOTP(email) {
        const pendingSignup = this.pendingSignups.get(email);
        if (!pendingSignup) {
            throw new common_1.BadRequestException('No pending signup found for this email');
        }
        const otp = this.generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        pendingSignup.otp = otp;
        pendingSignup.expiresAt = expiresAt;
        this.pendingSignups.set(email, pendingSignup);
        await this.emailService.sendOTP(email, otp, pendingSignup.firstName);
        return {
            message: 'New OTP sent to your email',
            expiresAt,
        };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        try {
            const { data, error } = await this.supabaseService
                .getClient()
                .auth.signInWithPassword({
                email,
                password,
            });
            if (error) {
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            const profile = await this.supabaseService.getUserProfile(data.user.id);
            const token = this.jwtService.sign({
                sub: data.user.id,
                email: data.user.email,
            });
            return {
                message: 'Login successful',
                user: {
                    id: data.user.id,
                    email: data.user.email,
                    username: profile.username,
                    firstName: profile.first_name,
                    lastName: profile.last_name,
                    walletAddress: profile.wallet_address,
                    totalPoints: profile.total_points,
                },
                token,
            };
        }
        catch (error) {
            this.logger.error('Login failed:', error);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
    }
    async getProfile(userId) {
        const profile = await this.supabaseService.getUserProfile(userId);
        return {
            id: profile.id,
            email: profile.email,
            username: profile.username,
            firstName: profile.first_name,
            lastName: profile.last_name,
            walletAddress: profile.wallet_address,
            totalPoints: profile.total_points,
            avatarUrl: profile.avatar_url,
            location: profile.location,
        };
    }
    generateSecurePassword() {
        return crypto.randomBytes(32).toString('hex');
    }
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        wallet_service_1.WalletService,
        email_service_1.EmailService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map