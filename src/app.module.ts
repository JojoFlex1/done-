import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { AppController } from './app.controller';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './components/auth.module';
import { WalletModule } from './components/wallet/wallet.module';
import { WasteModule } from './components/waste/waste.module';
import { RewardsModule } from './rewards/rewards.module';
import { ConfigModule } from './config/config.module';
import { CustomConfigService } from './config/config.service';

@Module({
  imports: [
    ConfigModule, // Your custom global config module
    JwtModule.registerAsync({
      global: true,
      inject: [CustomConfigService],
      useFactory: (configService: CustomConfigService) => ({
        secret: configService.jwt.secret,
        signOptions: { 
          expiresIn: configService.jwt.expiresIn,
        },
      }),
    }),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          callback(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
    SupabaseModule,
    AuthModule,
    WalletModule,
    WasteModule,
    RewardsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}