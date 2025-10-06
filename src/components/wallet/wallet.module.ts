import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { SupabaseModule } from '../../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [WalletController], // THIS WAS MISSING!
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
