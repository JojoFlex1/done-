import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '../config/config.service';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    const emailConfig = this.configService.email;
    
    this.transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: false,
      auth: {
        user: emailConfig.user,
        pass: emailConfig.password,
      },
    });
  }

  async sendOTP(email: string, otp: string, firstName: string): Promise<void> {
    try {
      const emailConfig = this.configService.email;
      
      const mailOptions = {
        from: emailConfig.from,
        to: email,
        subject: 'RELOOP - Email Verification Code',
        html: this.getOTPEmailTemplate(firstName, otp),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`OTP sent to ${email}`);
    } catch (error) {
      this.logger.error('Failed to send OTP:', error);
      throw new Error('Failed to send verification email');
    }
  }

  private getOTPEmailTemplate(firstName: string, otp: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">♻️ RELOOP</h1>
          <p style="color: #E8F5E9; margin: 8px 0 0 0;">E-Waste Management & Rewards</p>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="color: #2E7D32;">Hello ${firstName}! 👋</h2>
          <p style="color: #555;">Welcome to RELOOP! Please verify your email with this code:</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <div style="color: #1B5E20; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
              ${otp}
            </div>
          </div>
          
          <p style="color: #666; font-size: 14px;">This code expires in 10 minutes.</p>
        </div>
      </div>
    `;
  }
}