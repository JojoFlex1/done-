import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '../supabase/supabase.service';
import { WalletService } from './wallet/wallet.service';
import { EmailService } from './email.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private supabaseService;
    private walletService;
    private emailService;
    private jwtService;
    private readonly logger;
    private pendingSignups;
    constructor(supabaseService: SupabaseService, walletService: WalletService, emailService: EmailService, jwtService: JwtService);
    signup(signupDto: SignupDto): Promise<{
        message: string;
        walletAddress: string;
        expiresAt: Date;
    }>;
    verifyOTP(email: string, otp: string): Promise<{
        message: string;
        user: {
            id: any;
            email: any;
            username: any;
            firstName: any;
            lastName: any;
            walletAddress: any;
        };
        token: string;
    }>;
    resendOTP(email: string): Promise<{
        message: string;
        expiresAt: Date;
    }>;
    login(loginDto: LoginDto): Promise<{
        message: string;
        user: {
            id: string;
            email: string;
            username: any;
            firstName: any;
            lastName: any;
            walletAddress: any;
            totalPoints: any;
        };
        token: string;
    }>;
    getProfile(userId: string): Promise<{
        id: any;
        email: any;
        username: any;
        firstName: any;
        lastName: any;
        walletAddress: any;
        totalPoints: any;
        avatarUrl: any;
        location: any;
    }>;
    private generateSecurePassword;
    private generateOTP;
}
