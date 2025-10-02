import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('generate')
  async generateWallet() {
    return this.walletService.generateWallet();
  }

  @Post('decrypt')
  async decryptMnemonic(@Body('encryptedData') encryptedData: string, @Body('password') password: string) {
    return this.walletService.decryptMnemonic(encryptedData, password);
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
