import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RewardsService } from './rewards.service';
import { AuthGuard } from '../components/auth.guard';

@ApiTags('ADA Rewards')
@Controller('rewards')
@UseGuards(AuthGuard)
export class RewardsController {
  constructor(private rewardsService: RewardsService) {}

  @Get('history')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get reward history' })
  async getRewardHistory(@Request() req) {
    return this.rewardsService.getUserRewardHistory(req.user.sub);
  }

  @Get('total')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get total rewards' })
  async getTotalRewards(@Request() req) {
    return this.rewardsService.getUserTotalRewards(req.user.sub);
  }
}
