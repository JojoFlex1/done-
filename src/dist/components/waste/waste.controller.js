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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WasteController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const waste_service_1 = require("./waste.service");
const auth_guard_1 = require("../auth.guard");
const waste_submission_dto_1 = require("./dto/waste-submission.dto");
let WasteController = class WasteController {
    constructor(wasteService) {
        this.wasteService = wasteService;
    }
    async submitWaste(req, submissionDto, photo) {
        return this.wasteService.submitWaste(req.user.sub, submissionDto, photo);
    }
    async getUserSubmissions(req) {
        return this.wasteService.getUserSubmissions(req.user.sub);
    }
    async getActiveBins() {
        return this.wasteService.getActiveBins();
    }
    async getWasteCategories() {
        return this.wasteService.getWasteCategories();
    }
    async validateQRCode(qrCode) {
        if (!qrCode) {
            throw new common_1.BadRequestException('QR code required');
        }
        return this.wasteService.validateQRCode(qrCode);
    }
    async getUserStats(req) {
        return this.wasteService.getUserStats(req.user.sub);
    }
};
exports.WasteController = WasteController;
__decorate([
    (0, common_1.Post)('submit'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Submit e-waste for recycling' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('photo')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, waste_submission_dto_1.WasteSubmissionDto, Object]),
    __metadata("design:returntype", Promise)
], WasteController.prototype, "submitWaste", null);
__decorate([
    (0, common_1.Get)('submissions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user submissions' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WasteController.prototype, "getUserSubmissions", null);
__decorate([
    (0, common_1.Get)('bins'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all active bins' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WasteController.prototype, "getActiveBins", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get waste categories' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WasteController.prototype, "getWasteCategories", null);
__decorate([
    (0, common_1.Get)('validate-qr'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Validate QR code' }),
    __param(0, (0, common_1.Query)('qr_code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WasteController.prototype, "validateQRCode", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user stats' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WasteController.prototype, "getUserStats", null);
exports.WasteController = WasteController = __decorate([
    (0, swagger_1.ApiTags)('E-Waste Management'),
    (0, common_1.Controller)('waste'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [waste_service_1.WasteService])
], WasteController);
//# sourceMappingURL=waste.controller.js.map