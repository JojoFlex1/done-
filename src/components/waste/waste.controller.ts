import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  UseGuards, 
  Request, 
  UseInterceptors, 
  UploadedFile,
  Query,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { WasteService } from './waste.service';
import { AuthGuard } from '../auth.guard';
import { WasteSubmissionDto } from './dto/waste-submission.dto';

@ApiTags('E-Waste Management')
@Controller('waste')
@UseGuards(AuthGuard)
export class WasteController {
  constructor(private wasteService: WasteService) {}

  @Post('submit')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit e-waste for recycling' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('photo'))
  async submitWaste(
    @Request() req,
    @Body() submissionDto: WasteSubmissionDto,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    return this.wasteService.submitWaste(req.user.sub, submissionDto, photo);
  }

  @Get('submissions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user submissions' })
  async getUserSubmissions(@Request() req) {
    return this.wasteService.getUserSubmissions(req.user.sub);
  }

  @Get('bins')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all active bins' })
  async getActiveBins() {
    return this.wasteService.getActiveBins();
  }

  @Get('categories')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get waste categories' })
  async getWasteCategories() {
    return this.wasteService.getWasteCategories();
  }

  @Get('validate-qr')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validate QR code' })
  async validateQRCode(@Query('qr_code') qrCode: string) {
    if (!qrCode) {
      throw new BadRequestException('QR code required');
    }
    return this.wasteService.validateQRCode(qrCode);
  }

  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user stats' })
  async getUserStats(@Request() req) {
    return this.wasteService.getUserStats(req.user.sub);
  }
}
