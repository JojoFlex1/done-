"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WasteService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WasteService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
const rewards_service_1 = require("../../rewards/rewards.service");
let WasteService = WasteService_1 = class WasteService {
    constructor(supabaseService, rewardsService) {
        this.supabaseService = supabaseService;
        this.rewardsService = rewardsService;
        this.logger = new common_1.Logger(WasteService_1.name);
        this.wasteCategories = {
            'usb_cable': { points: 1000000, category: 'cables' },
            'phone_charger': { points: 1000000, category: 'cables' },
            'laptop_charger': { points: 1000000, category: 'cables' },
            'smartphone': { points: 3000000, category: 'mobile_devices' },
            'laptop': { points: 5000000, category: 'large_electronics' },
            'phone_battery': { points: 7000000, category: 'batteries' },
        };
    }
    async submitWaste(userId, submissionDto, photoFile) {
        const { qr_code, waste_type, weight_kg, description } = submissionDto;
        try {
            if (!this.wasteCategories[waste_type]) {
                throw new common_1.BadRequestException(`Invalid waste type: ${waste_type}`);
            }
            const bin = await this.supabaseService.getBinByQR(qr_code);
            if (!bin) {
                throw new common_1.NotFoundException('Invalid QR code');
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
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Waste submission failed');
        }
    }
    async getUserSubmissions(userId) {
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
    async validateQRCode(qrCode) {
        try {
            const bin = await this.supabaseService.getBinByQR(qrCode);
            return { valid: true, bin: { id: bin.id, name: bin.name, address: bin.address } };
        }
        catch (error) {
            return { valid: false, error: 'Invalid QR code' };
        }
    }
    async getUserStats(userId) {
        const submissions = await this.supabaseService.getUserSubmissions(userId);
        const totalPoints = await this.supabaseService.getUserTotalPoints(userId);
        return {
            total_submissions: submissions.length,
            total_points: totalPoints,
            total_ada: totalPoints / 1000000,
        };
    }
};
exports.WasteService = WasteService;
exports.WasteService = WasteService = WasteService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        rewards_service_1.RewardsService])
], WasteService);
//# sourceMappingURL=waste.service.js.map