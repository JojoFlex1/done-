import { SupabaseService } from '../../supabase/supabase.service';
import { RewardsService } from '../../rewards/rewards.service';
import { WasteSubmissionDto } from './dto/waste-submission.dto';
export declare class WasteService {
    private supabaseService;
    private rewardsService;
    private readonly logger;
    private wasteCategories;
    constructor(supabaseService: SupabaseService, rewardsService: RewardsService);
    submitWaste(userId: string, submissionDto: WasteSubmissionDto, photoFile?: Express.Multer.File): Promise<{
        success: boolean;
        submission: {
            id: any;
            waste_type: string;
            points_earned: any;
            ada_amount: number;
            photo_url: any;
        };
        bin: {
            name: any;
            address: any;
        };
        reward: {
            points: any;
            ada: number;
        };
    }>;
    getUserSubmissions(userId: string): Promise<{
        id: any;
        waste_type: any;
        points_earned: any;
        ada_amount: number;
        photo_url: any;
        status: any;
        created_at: any;
    }[]>;
    getActiveBins(): Promise<{
        id: any;
        name: any;
        qr_code: any;
        address: any;
    }[]>;
    getWasteCategories(): {
        waste_type: string;
        points: number;
        ada_amount: number;
        category: string;
    }[];
    validateQRCode(qrCode: string): Promise<{
        valid: boolean;
        bin: {
            id: any;
            name: any;
            address: any;
        };
        error?: undefined;
    } | {
        valid: boolean;
        error: string;
        bin?: undefined;
    }>;
    getUserStats(userId: string): Promise<{
        total_submissions: number;
        total_points: any;
        total_ada: number;
    }>;
}
