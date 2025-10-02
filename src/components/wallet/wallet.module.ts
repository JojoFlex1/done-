import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ConfigService } from '../../config/config.service';

@Module({
  providers: [WalletService, ConfigService],
  exports: [WalletService],
})
export class WalletModule {}