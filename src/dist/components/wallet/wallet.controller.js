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
exports.WalletController = void 0;
const common_1 = require("@nestjs/common");
const wallet_service_1 = require("./wallet.service");
let WalletController = class WalletController {
    constructor(walletService) {
        this.walletService = walletService;
    }
    async generateWallet() {
        return this.walletService.generateWallet();
    }
    async decryptMnemonic(encryptedData, password) {
        return this.walletService.decryptMnemonic(encryptedData, password);
    }
    async validateAddress(address) {
        return {
            address,
            isValid: this.walletService.validateAddress(address),
        };
    }
    async getCurrentNetwork() {
        return {
            network: this.walletService.getCurrentNetwork(),
            isMainnet: this.walletService.isMainnet(),
        };
    }
    async convertAdaToLovelaces(ada) {
        return {
            ada,
            lovelaces: this.walletService.adaToLovelaces(ada),
        };
    }
    async convertLovelacesToAda(lovelaces) {
        return {
            lovelaces,
            ada: this.walletService.lovelacesToAda(lovelaces),
        };
    }
};
exports.WalletController = WalletController;
__decorate([
    (0, common_1.Post)('generate'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "generateWallet", null);
__decorate([
    (0, common_1.Post)('decrypt'),
    __param(0, (0, common_1.Body)('encryptedData')),
    __param(1, (0, common_1.Body)('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "decryptMnemonic", null);
__decorate([
    (0, common_1.Get)('validate/:address'),
    __param(0, (0, common_1.Param)('address')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "validateAddress", null);
__decorate([
    (0, common_1.Get)('network'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getCurrentNetwork", null);
__decorate([
    (0, common_1.Post)('convert/ada-to-lovelaces'),
    __param(0, (0, common_1.Body)('ada')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "convertAdaToLovelaces", null);
__decorate([
    (0, common_1.Post)('convert/lovelaces-to-ada'),
    __param(0, (0, common_1.Body)('lovelaces')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "convertLovelacesToAda", null);
exports.WalletController = WalletController = __decorate([
    (0, common_1.Controller)('wallet'),
    __metadata("design:paramtypes", [wallet_service_1.WalletService])
], WalletController);
//# sourceMappingURL=wallet.controller.js.map