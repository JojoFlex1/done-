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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = exports.CustomConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let CustomConfigService = class CustomConfigService {
    constructor(configService) {
        this.configService = configService;
    }
    get supabase() {
        return {
            url: this.configService.get('SUPABASE_URL'),
            anonKey: this.configService.get('SUPABASE_ANON_KEY'),
            serviceRoleKey: this.configService.get('SUPABASE_SERVICE_ROLE_KEY'),
        };
    }
    get jwt() {
        return {
            secret: this.configService.get('JWT_SECRET'),
            expiresIn: this.configService.get('JWT_EXPIRE') || '24h',
        };
    }
    get email() {
        return {
            host: this.configService.get('MAIL_HOST') || 'smtp.gmail.com',
            port: this.configService.get('MAIL_PORT') || 587,
            user: this.configService.get('MAIL_USER'),
            password: this.configService.get('MAIL_PASSWORD'),
            from: this.configService.get('MAIL_FROM'),
        };
    }
    get cardano() {
        return {
            network: this.configService.get('CARDANO_NETWORK') || 'Preprod',
        };
    }
    get encryption() {
        return {
            key: this.configService.get('ENCRYPTION_KEY') ||
                this.configService.get('ENCRYPT_KEY'),
        };
    }
    get upload() {
        return {
            path: this.configService.get('UPLOAD_PATH') || './uploads',
            maxFileSize: this.configService.get('MAX_FILE_SIZE') || 5242880,
        };
    }
    get urls() {
        return {
            backend: this.configService.get('BACKEND_URL') || 'http://localhost:3001',
            frontend: this.configService.get('FRONTEND_URL') || 'http://localhost:3000',
            corsOrigin: this.configService.get('CORS_ORIGIN') || 'http://localhost:3000',
        };
    }
    get treasury() {
        return {
            contractAddress: this.configService.get('TREASURY_CONTRACT_ADDRESS'),
            mnemonic: this.configService.get('TREASURY_MNEMONIC'),
        };
    }
    get(key, defaultValue) {
        return this.configService.get(key, defaultValue);
    }
};
exports.CustomConfigService = CustomConfigService;
exports.ConfigService = CustomConfigService;
exports.ConfigService = exports.CustomConfigService = CustomConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CustomConfigService);
//# sourceMappingURL=config.service.js.map