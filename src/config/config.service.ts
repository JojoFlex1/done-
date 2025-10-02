import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class CustomConfigService {
  constructor(private configService: NestConfigService) {}

  get supabase() {
    return {
      url: this.configService.get<string>('SUPABASE_URL'),
      anonKey: this.configService.get<string>('SUPABASE_ANON_KEY'),
      serviceRoleKey: this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY'),
    };
  }

  get jwt() {
    return {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRE') || '24h',
    };
  }

  get email() {
    return {
      host: this.configService.get<string>('MAIL_HOST') || 'smtp.gmail.com',
      port: this.configService.get<number>('MAIL_PORT') || 587,
      user: this.configService.get<string>('MAIL_USER'),
      password: this.configService.get<string>('MAIL_PASSWORD'),
      from: this.configService.get<string>('MAIL_FROM'),
    };
  }

  get cardano() {
    return {
      network: this.configService.get<string>('CARDANO_NETWORK') || 'Preprod',
    };
  }

  get encryption() {
    return {
      key: this.configService.get<string>('ENCRYPTION_KEY') || 
            this.configService.get<string>('ENCRYPT_KEY'),
    };
  }

  get upload() {
    return {
      path: this.configService.get<string>('UPLOAD_PATH') || './uploads',
      maxFileSize: this.configService.get<number>('MAX_FILE_SIZE') || 5242880,
    };
  }

  get urls() {
    return {
      backend: this.configService.get<string>('BACKEND_URL') || 'http://localhost:3001',
      frontend: this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000',
      corsOrigin: this.configService.get<string>('CORS_ORIGIN') || 'http://localhost:3000',
    };
  }

  get treasury() {
    return {
      contractAddress: this.configService.get<string>('TREASURY_CONTRACT_ADDRESS'),
      mnemonic: this.configService.get<string>('TREASURY_MNEMONIC'),
    };
  }

  // Helper method to get any config value directly
  get<T = string>(key: string, defaultValue?: T): T {
    return this.configService.get<T>(key, defaultValue);
  }
}export { CustomConfigService as ConfigService };
