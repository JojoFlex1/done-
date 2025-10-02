import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '../supabase/supabase.service';
import { WalletService } from './wallet/wallet.service';
import { EmailService } from './email.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as crypto from 'crypto';

interface PendingSignup {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  walletAddress: string;
  rewardAddress: string;
  encryptedMnemonic: string;
  password: string;
  otp: string;
  expiresAt: Date;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private pendingSignups = new Map<string, PendingSignup>();

  constructor(
    private supabaseService: SupabaseService,
    private walletService: WalletService,
    private emailService: EmailService,
    private jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { email, username, firstName, lastName } = signupDto;

    try {
      const existingUser = await this.supabaseService.getUserByEmail(email);
      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
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
    } catch (error) {
      this.logger.error('Signup failed:', error);
      throw error;
    }
  }

  async verifyOTP(email: string, otp: string) {
    const pendingSignup = this.pendingSignups.get(email);

    if (!pendingSignup) {
      throw new BadRequestException('No pending signup found for this email');
    }

    if (pendingSignup.expiresAt < new Date()) {
      this.pendingSignups.delete(email);
      throw new BadRequestException('OTP has expired');
    }

    if (pendingSignup.otp !== otp.trim()) {
      throw new UnauthorizedException('Invalid OTP');
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
    } catch (error) {
      this.logger.error('User creation failed:', error);
      throw error;
    }
  }

  async resendOTP(email: string) {
    const pendingSignup = this.pendingSignups.get(email);

    if (!pendingSignup) {
      throw new BadRequestException('No pending signup found for this email');
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

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        throw new UnauthorizedException('Invalid credentials');
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
    } catch (error) {
      this.logger.error('Login failed:', error);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async getProfile(userId: string) {
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

  private generateSecurePassword(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
