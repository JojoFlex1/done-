import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signup(signupDto: SignupDto): Promise<{
        message: string;
        walletAddress: string;
        expiresAt: Date;
    }>;
    verifyOTP(verifyOtpDto: VerifyOtpDto): Promise<{
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
    resendOTP(body: {
        email: string;
    }): Promise<{
        message: string;
        expiresAt: Date;
    }>;
    getProfile(req: any): Promise<{
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
}
