import { Module } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { RewardsController } from './rewards.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { WalletModule } from '../components/wallet/wallet.module';

@Module({
  imports: [SupabaseModule, WalletModule],
  controllers: [RewardsController],
  providers: [RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}
