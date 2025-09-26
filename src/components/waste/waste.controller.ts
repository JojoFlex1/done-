throw new BadRequestException('Failed to save photo');
    }
  }
}

// ================================================================
// src/waste/waste.controller.ts - E-Waste Management Controller
// ================================================================
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
import { 
  ApiTags, 
  ApiOperation, 
  ApiBearerAuth, 
  ApiConsumes, 
  ApiResponse,
  ApiQuery 
} from '@nestjs/swagger';
import { WasteService } from './waste.service';
import { AuthGuard } from '../auth/auth.guard';
import { WasteSubmissionDto } from './dto/waste-submission.dto';

@ApiTags('E-Waste Management')
@Controller('waste')
@UseGuards(AuthGuard)
export class WasteController {
  constructor(private wasteService: WasteService) {}

  @Post('submit')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Submit e-waste for recycling and earn ADA rewards',
    description: 'Upload a photo of e-waste, scan QR code, and earn ADA tokens based on waste type'
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Waste submitted successfully, rewards processed' })
  @ApiResponse({ status: 400, description: 'Invalid waste type or QR code' })
  @ApiResponse({ status: 404, description: 'Bin not found or inactive' })
  @UseInterceptors(FileInterceptor('photo', {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, callback) => {
      // Accept only image files
      if (!file.mimetype.startsWith('image/')) {
        return callback(new BadRequestException('Only image files are allowed'), false);
      }
      callback(null, true);
    },
  }))
  async submitWaste(
    @Request() req,
    @Body() submissionDto: WasteSubmissionDto,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    return this.wasteService.submitWaste(req.user.sub, submissionDto, photo);
  }

  @Get('submissions')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get user\'s waste submission history',
    description: 'Retrieve all waste submissions made by the authenticated user'
  })
  @ApiResponse({ status: 200, description: 'Submissions retrieved successfully' })
  async getUserSubmissions(@Request() req) {
    return this.wasteService.getUserSubmissions(req.user.sub);
  }

  @Get('bins')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get all active waste collection bins',
    description: 'Retrieve all active bins where users can drop off e-waste'
  })
  @ApiResponse({ status: 200, description: 'Active bins retrieved successfully' })
  async getActiveBins() {
    return this.wasteService.getActiveBins();
  }

  @Get('categories')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get waste types and their ADA rewards',
    description: 'Get list of all supported waste types with their point/ADA values'
  })
  @ApiResponse({ status: 200, description: 'Waste categories retrieved successfully' })
  async getWasteCategories() {
    return this.wasteService.getWasteCategories();
  }

  @Get('categories/grouped')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get waste categories grouped by type',
    description: 'Get waste types organized by category (cables, electronics, etc.)'
  })
  async getWasteCategoriesGrouped() {
    return this.wasteService.getWasteCategoriesGrouped();
  }

  @Get('validate-qr')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Validate QR code and get bin information',
    description: 'Check if a QR code is valid and return bin details'
  })
  @ApiQuery({ name: 'qr_code', example: 'QR_BIN001' })
  @ApiResponse({ status: 200, description: 'QR code validated successfully' })
  async validateQRCode(@Query('qr_code') qrCode: string) {
    if (!qrCode) {
      throw new BadRequestException('QR code parameter is required');
    }
    return this.wasteService.validateQRCode(qrCode);
  }

  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get user waste recycling statistics',
    description: 'Get detailed stats about user\'s recycling activity'
  })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getUserStats(@Request() req) {
    return this.wasteService.getUserStats(req.user.sub);
  }
}// ================================================================
// src/waste/waste.module.ts
// ================================================================
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { WasteController } from './waste.controller';
import { WasteService } from './waste.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { RewardsModule } from '../rewards/rewards.module';
import { ConfigService } from '../config/config.service';

@Module({
  imports: [
    SupabaseModule,
    RewardsModule,
    MulterModule,
  ],
  controllers: [WasteController],
  providers: [WasteService, ConfigService],
  exports: [WasteService],
})
export class WasteModule {}

// ================================================================
// src/waste/dto/waste-submission.dto.ts
// ================================================================
import { IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class WasteSubmissionDto {
  @ApiProperty({ 
    example: 'QR_BIN001', 
    description: 'QR code from the waste collection bin' 
  })
  @IsNotEmpty()
  qr_code: string;

  @ApiProperty({ 
    example: 'smartphone', 
    description: 'Type of e-waste being submitted',
    enum: [
      'usb_cable', 'phone_charger', 'laptop_charger', 'hdmi_cable', 'audio_cable',
      'headphones', 'earbuds', 'bluetooth_speaker', 'computer_mouse', 'keyboard',
      'remote_control', 'calculator', 'smartphone', 'basic_phone', 'smartwatch',
      'fitness_tracker', 'portable_speaker', 'gaming_controller', 'tablet',
      'laptop', 'desktop_computer', 'monitor', 'printer', 'phone_battery',
      'laptop_battery', 'power_bank', 'car_battery', 'ups_battery'
    ]
  })
  @IsNotEmpty()
  waste_type: string;

  @ApiProperty({ 
    example: 0.5, 
    required: false, 
    description: 'Weight of the e-waste in kg (optional)' 
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0.01)
  @Max(50)
  weight_kg?: number;

  @ApiProperty({ 
    example: 'Old iPhone 12 with cracked screen', 
    required: false,
    description: 'Additional description of the e-waste (optional)'
  })
  @IsOptional()
  description?: string;
}

// ================================================================
// src/waste/waste.service.ts - E-Waste Management Service
// ================================================================
import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { RewardsService } from '../rewards/rewards.service';
import { WasteSubmissionDto } from './dto/waste-submission.dto';

@Injectable()
export class WasteService {
  private readonly logger = new Logger(WasteService.name);

  // Waste categories matching your smart contract exactly
  private wasteCategories = {
    // Cables & Chargers - 1 ADA (1,000,000 lovelaces)
    'usb_cable': { points: 1000000, category: 'cables' },
    'phone_charger': { points: 1000000, category: 'cables' },
    'laptop_charger': { points: 1000000, category: 'cables' },
    'hdmi_cable': { points: 1000000, category: 'cables' },
    'audio_cable': { points: 1000000, category: 'cables' },
    
    // Small Electronics - 1.5 ADA (1,500,000 lovelaces)
    'headphones': { points: 1500000, category: 'small_electronics' },
    'earbuds': { points: 1500000, category: 'small_electronics' },
    'bluetooth_speaker': { points: 1500000, category: 'small_electronics' },
    'computer_mouse': { points: 1500000, category: 'small_electronics' },
    'keyboard': { points: 1500000, category: 'small_electronics' },
    'remote_control': { points: 1500000, category: 'small_electronics' },
    'calculator': { points: 1500000, category: 'small_electronics' },
    
    // Mobile Devices - 3 ADA (3,000,000 lovelaces)
    'smartphone': { points: 3000000, category: 'mobile_devices' },
    'basic_phone': { points: 3000000, category: 'mobile_devices' },
    'smartwatch': { points: 3000000, category: 'mobile_devices' },
    'fitness_tracker': { points: 3000000, category: 'mobile_devices' },
    'portable_speaker': { points: 3000000, category: 'mobile_devices' },
    'gaming_controller': { points: 3000000, category: 'mobile_devices' },
    
    // Large Electronics - 5 ADA (5,000,000 lovelaces)
    'tablet': { points: 5000000, category: 'large_electronics' },
    'laptop': { points: 5000000, category: 'large_electronics' },
    'desktop_computer': { points: 5000000, category: 'large_electronics' },
    'monitor': { points: 5000000, category: 'large_electronics' },
    'printer': { points: 5000000, category: 'large_electronics' },
    
    // Batteries - 7 ADA (7,000,000 lovelaces)
    'phone_battery': { points: 7000000, category: 'batteries' },
    'laptop_battery': { points: 7000000, category: 'batteries' },
    'power_bank': { points: 7000000, category: 'batteries' },
    'car_battery': { points: 7000000, category: 'batteries' },
    'ups_battery': { points: 7000000, category: 'batteries' },
  };

  constructor(
    private supabaseService: SupabaseService,
    private rewardsService: RewardsService,
  ) {}

  /**
   * Submit e-waste for processing and rewards
   */
  async submitWaste(
    userId: string, 
    submissionDto: WasteSubmissionDto, 
    photoFile?: Express.Multer.File
  ) {
    const { qr_code, waste_type, weight_kg, description } = submissionDto;

    try {
      // Validate waste type against our categories
      if (!this.wasteCategories[waste_type]) {
        throw new BadRequestException(
          `Invalid waste type: ${waste_type}. Please check supported waste types.`
        );
      }

      // Get bin information from QR code
      const bin = await this.supabaseService.getBinByQR(qr_code);
      if (!bin) {
        throw new NotFoundException('Invalid QR code or bin is not active');
      }

      // Check if bin accepts this waste type
      if (bin.accepted_waste_types && 
          bin.accepted_waste_types.length > 0 && 
          !bin.accepted_waste_types.includes(waste_type)) {
        throw new BadRequestException(
          `This bin does not accept ${waste_type}. Accepted types: ${bin.accepted_waste_types.join(', ')}`
        );
      }

      // Calculate points based on waste type (matches smart contract)
      const wasteInfo = this.wasteCategories[waste_type];
      const pointsEarned = wasteInfo.points;

      // Handle photo upload if provided
      let photoUrl = null;
      if (photoFile) {
        photoUrl = await this.savePhotoFile(photoFile, userId);
      }

      // Create waste submission record
      const submission = await this.supabaseService.createWasteSubmission({
        user_id: userId,
        bin_id: bin.id,
        waste_type,
        photo_url: photoUrl,
        points_earned: pointsEarned,
        weight_kg: weight_kg || null,
      });

      // Create point transaction
      const transaction = await this.supabaseService.createPointTransaction({
        user_id: userId,
        submission_id: submission.id,
        points: pointsEarned,
        transaction_type: 'earned',
        description: `Recycled ${waste_type} at ${bin.name}${description ? ` - ${description}` : ''}`,
      });

      this.logger.log(
        `Waste submitted: ${waste_type} by user ${userId}, earned ${pointsEarned} points`
      );

      // Process ADA reward on blockchain (async, non-blocking)
      this.rewardsService.processReward(userId, pointsEarned, submission.id)
        .catch(error => {
          this.logger.error(`Failed to process blockchain reward for submission ${submission.id}:`, error);
          // Continue with local points even if blockchain fails
        });

      return {
        success: true,
        submission: {
          id: submission.id,
          waste_type,
          points_earned: pointsEarned,
          ada_amount: pointsEarned / 1000000,
          photo_url: photoUrl,
          status: submission.status,
          created_at: submission.created_at,
        },
        bin: {
          id: bin.id,
          name: bin.name,
          address: bin.address,
          location: {
            latitude: bin.latitude,
            longitude: bin.longitude,
          },
        },
        reward: {
          points: pointsEarned,
          ada: pointsEarned / 1000000,
          category: wasteInfo.category,
        },
      };
    } catch (error) {
      this.logger.error('Failed to submit waste:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to submit waste. Please try again.');
    }
  }

  /**
   * Get user's waste submission history
   */
  async getUserSubmissions(userId: string) {
    try {
      const submissions = await this.supabaseService.getUserSubmissions(userId);
      
      return submissions.map(submission => ({
        id: submission.id,
        waste_type: submission.waste_type,
        points_earned: submission.points_earned,
        ada_amount: submission.points_earned / 1000000,
        photo_url: submission.photo_url,
        weight_kg: submission.weight_kg,
        status: submission.status,
        created_at: submission.created_at,
        verified_at: submission.verified_at,
        blockchain_hash: submission.blockchain_hash,
        bin: submission.bins ? {
          name: submission.bins.name,
          address: submission.bins.address,
          location: {
            latitude: submission.bins.latitude,
            longitude: submission.bins.longitude,
          },
        } : null,
      }));
    } catch (error) {
      this.logger.error('Failed to get user submissions:', error);
      throw new BadRequestException('Failed to retrieve submissions');
    }
  }

  /**
   * Get all active waste collection bins
   */
  async getActiveBins() {
    try {
      const bins = await this.supabaseService.getAllActiveBins();
      
      return bins.map(bin => ({
        id: bin.id,
        name: bin.name,
        qr_code: bin.qr_code,
        address: bin.address,
        location: {
          latitude: bin.latitude,
          longitude: bin.longitude,
        },
        accepted_waste_types: bin.accepted_waste_types || [],
        status: bin.status,
      }));
    } catch (error) {
      this.logger.error('Failed to get active bins:', error);
      throw new BadRequestException('Failed to retrieve bins');
    }
  }

  /**
   * Get waste categories and their rewards
   */
  getWasteCategories() {
    return Object.entries(this.wasteCategories).map(([type, info]) => ({
      waste_type: type,
      points: info.points,
      ada_amount: info.points / 1000000,
      category: info.category,
    }));
  }

  /**
   * Get waste categories grouped by category
   */
  getWasteCategoriesGrouped() {
    const grouped = {};
    
    Object.entries(this.wasteCategories).forEach(([type, info]) => {
      if (!grouped[info.category]) {
        grouped[info.category] = {
          category: info.category,
          ada_reward: info.points / 1000000,
          waste_types: [],
        };
      }
      grouped[info.category].waste_types.push(type);
    });
    
    return Object.values(grouped);
  }

  /**
   * Validate QR code and return bin information
   */
  async validateQRCode(qrCode: string) {
    try {
      const bin = await this.supabaseService.getBinByQR(qrCode);
      
      return {
        valid: true,
        bin: {
          id: bin.id,
          name: bin.name,
          address: bin.address,
          location: {
            latitude: bin.latitude,
            longitude: bin.longitude,
          },
          accepted_waste_types: bin.accepted_waste_types || [],
          status: bin.status,
        },
      };
    } catch (error) {
      return {
        valid: false,
        error: 'Invalid QR code or bin not active',
      };
    }
  }

  /**
   * Get submission statistics for a user
   */
  async getUserStats(userId: string) {
    try {
      const submissions = await this.supabaseService.getUserSubmissions(userId);
      const totalPoints = await this.supabaseService.getUserTotalPoints(userId);
      
      const stats = {
        total_submissions: submissions.length,
        total_points: totalPoints,
        total_ada: totalPoints / 1000000,
        categories_recycled: new Set(submissions.map(s => this.wasteCategories[s.waste_type]?.category)).size,
        recent_submissions: submissions.slice(0, 5),
        breakdown_by_category: {},
      };
      
      // Calculate breakdown by category
      submissions.forEach(submission => {
        const category = this.wasteCategories[submission.waste_type]?.category || 'unknown';
        if (!stats.breakdown_by_category[category]) {
          stats.breakdown_by_category[category] = {
            count: 0,
            points: 0,
            ada: 0,
          };
        }
        stats.breakdown_by_category[category].count += 1;
        stats.breakdown_by_category[category].points += submission.points_earned;
        stats.breakdown_by_category[category].ada += submission.points_earned / 1000000;
      });
      
      return stats;
    } catch (error) {
      this.logger.error('Failed to get user stats:', error);
      throw new BadRequestException('Failed to retrieve statistics');
    }
  }

  /**
   * Save uploaded photo file (implement proper storage)
   */
  private async savePhotoFile(file: Express.Multer.File, userId: string): Promise<string> {
    try {
      // In production, upload to Supabase Storage or similar service
      // For now, return the local file path
      const fileName = `waste_${userId}_${Date.now()}_${file.originalname}`;
      const filePath = `/uploads/${fileName}`;
      
      this.logger.log(`Photo saved: ${filePath}`);
      return filePath;
    } catch (error) {
      this.logger.error('Failed to save photo:', error);
      throw new BadRequestException('Failed to save photo');
    }
  }
}