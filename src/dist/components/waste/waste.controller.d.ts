import { WasteService } from './waste.service';
import { WasteSubmissionDto } from './dto/waste-submission.dto';
export declare class WasteController {
    private wasteService;
    constructor(wasteService: WasteService);
    submitWaste(req: any, submissionDto: WasteSubmissionDto, photo?: Express.Multer.File): Promise<{
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
    getUserSubmissions(req: any): Promise<{
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
    getWasteCategories(): Promise<{
        waste_type: string;
        points: number;
        ada_amount: number;
        category: string;
    }[]>;
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
    getUserStats(req: any): Promise<{
        total_submissions: number;
        total_points: any;
        total_ada: number;
    }>;
}
