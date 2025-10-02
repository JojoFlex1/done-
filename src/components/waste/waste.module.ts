import { Module } from '@nestjs/common';
import { WasteController } from './waste.controller';
import { WasteService } from './waste.service';
import { SupabaseModule } from '../../supabase/supabase.module';
import { RewardsModule } from '../../rewards/rewards.module';

@Module({
  imports: [SupabaseModule, RewardsModule],
  controllers: [WasteController],
  providers: [WasteService],
  exports: [WasteService],
})
export class WasteModule {}
