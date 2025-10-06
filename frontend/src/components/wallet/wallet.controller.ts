import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { AuthGuard } from '../auth.guard';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  /**
   * CREATE WALLET FOR LOGGED-IN USER
   * This generates unique wallet and saves to profile table
   */
  @Post('create')
  @UseGuards(AuthGuard)
  async createUserWallet(@Request() req) {
    const userId = req.user.sub;
    const wallet = await this.walletService.generateAndSaveWallet(userId);
    
    return {
      success: true,
      message: '⚠️ SAVE YOUR MNEMONIC! This is shown only once!',
      data: {
        address: wallet.address,
        rewardAddress: wallet.rewardAddress,
        mnemonic: wallet.mnemonic, // 24 words - user MUST save!
      },
    };
  }

  /**
   * GET MY WALLET (NO MNEMONIC - safe for UI)
   */
  @Get('my-wallet')
  @UseGuards(AuthGuard)
  async getMyWallet(@Request() req) {
    const userId = req.user.sub;
    const wallet = await this.walletService.getUserWallet(userId);
    
    return {
      success: true,
      data: {
        address: wallet.address,
        rewardAddress: wallet.rewardAddress,
      },
    };
  }

  /**
   * GENERATE TEST WALLET (doesn't save - for testing only)
   */
  @Post('generate')
  async generateTestWallet() {
    const wallet = this.walletService.generateWallet();
    return {
      success: true,
      message: 'Test wallet (not saved to database)',
      data: {
        address: wallet.address,
        rewardAddress: wallet.rewardAddress,
        mnemonic: wallet.mnemonic,
        wordCount: wallet.mnemonic.split(' ').length,
      },
    };
  }

  @Post('decrypt')
  async decryptMnemonic(
    @Body('encryptedData') encryptedData: string,
    @Body('password') password: string,
  ) {
    const mnemonic = this.walletService.decryptMnemonic(encryptedData, password);
    return { 
      success: true,
      mnemonic,
      wordCount: mnemonic.split(' ').length,
    };
  }

  @Get('validate/:address')
  async validateAddress(@Param('address') address: string) {
    return {
      address,
      isValid: this.walletService.validateAddress(address),
    };
  }

  @Get('network')
  async getCurrentNetwork() {
    return {
      network: this.walletService.getCurrentNetwork(),
      isMainnet: this.walletService.isMainnet(),
    };
  }

  @Post('convert/ada-to-lovelaces')
  async convertAdaToLovelaces(@Body('ada') ada: number) {
    return {
      ada,
      lovelaces: this.walletService.adaToLovelaces(ada),
    };
  }

  @Post('convert/lovelaces-to-ada')
  async convertLovelacesToAda(@Body('lovelaces') lovelaces: number) {
    return {
      lovelaces,
      ada: this.walletService.lovelacesToAda(lovelaces),
    };
  }
}
