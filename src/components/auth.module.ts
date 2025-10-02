import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { EmailService } from './email.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { WalletModule } from './wallet/wallet.module';
import { ConfigService } from '../config/config.service';

@Module({
  imports: [
    ConfigModule,
    SupabaseModule,
    WalletModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.jwt.secret,
        signOptions: { expiresIn: configService.jwt.expiresIn },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, EmailService, ConfigService],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
