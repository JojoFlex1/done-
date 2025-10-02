import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { RewardsService } from '../../rewards/rewards.service';
import { WasteSubmissionDto } from './dto/waste-submission.dto';

@Injectable()
export class WasteService {
  private readonly logger = new Logger(WasteService.name);

  private wasteCategories = {
    'usb_cable': { points: 1000000, category: 'cables' },
    'phone_charger': { points: 1000000, category: 'cables' },
    'laptop_charger': { points: 1000000, category: 'cables' },
    'smartphone': { points: 3000000, category: 'mobile_devices' },
    'laptop': { points: 5000000, category: 'large_electronics' },
    'phone_battery': { points: 7000000, category: 'batteries' },
  };

  constructor(
    private supabaseService: SupabaseService,
    private rewardsService: RewardsService,
  ) {}

  async submitWaste(userId: string, submissionDto: WasteSubmissionDto, photoFile?: Express.Multer.File) {
    const { qr_code, waste_type, weight_kg, description } = submissionDto;

    try {
      if (!this.wasteCategories[waste_type]) {
        throw new BadRequestException(`Invalid waste type: ${waste_type}`);
      }

      const bin = await this.supabaseService.getBinByQR(qr_code);
      if (!bin) {
        throw new NotFoundException('Invalid QR code');
      }

      const wasteInfo = this.wasteCategories[waste_type];
      const pointsEarned = wasteInfo.points;

      let photoUrl = null;
      if (photoFile) {
        photoUrl = `/uploads/${photoFile.filename}`;
      }

      const submission = await this.supabaseService.createWasteSubmission({
        user_id: userId,
        bin_id: bin.id,
        waste_type,
        photo_url: photoUrl,
        points_earned: pointsEarned,
        weight_kg: weight_kg || null,
      });

      await this.supabaseService.createPointTransaction({
        user_id: userId,
        submission_id: submission.id,
        points: pointsEarned,
        transaction_type: 'earned',
        description: `Recycled ${waste_type} at ${bin.name}`,
      });

      return {
        success: true,
        submission: {
          id: submission.id,
          waste_type,
          points_earned: pointsEarned,
          ada_amount: pointsEarned / 1000000,
          photo_url: photoUrl,
        },
        bin: { name: bin.name, address: bin.address },
        reward: { points: pointsEarned, ada: pointsEarned / 1000000 },
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Waste submission failed');
    }
  }

  async getUserSubmissions(userId: string) {
    const submissions = await this.supabaseService.getUserSubmissions(userId);
    return submissions.map(submission => ({
      id: submission.id,
      waste_type: submission.waste_type,
      points_earned: submission.points_earned,
      ada_amount: submission.points_earned / 1000000,
      photo_url: submission.photo_url,
      status: submission.status,
      created_at: submission.created_at,
    }));
  }

  async getActiveBins() {
    const bins = await this.supabaseService.getAllActiveBins();
    return bins.map(bin => ({
      id: bin.id,
      name: bin.name,
      qr_code: bin.qr_code,
      address: bin.address,
    }));
  }

  getWasteCategories() {
    return Object.entries(this.wasteCategories).map(([type, info]) => ({
      waste_type: type,
      points: info.points,
      ada_amount: info.points / 1000000,
      category: info.category,
    }));
  }

  async validateQRCode(qrCode: string) {
    try {
      const bin = await this.supabaseService.getBinByQR(qrCode);
      return { valid: true, bin: { id: bin.id, name: bin.name, address: bin.address } };
    } catch (error) {
      return { valid: false, error: 'Invalid QR code' };
    }
  }

  async getUserStats(userId: string) {
    const submissions = await this.supabaseService.getUserSubmissions(userId);
    const totalPoints = await this.supabaseService.getUserTotalPoints(userId);
    
    return {
      total_submissions: submissions.length,
      total_points: totalPoints,
      total_ada: totalPoints / 1000000,
    };
  }
}
