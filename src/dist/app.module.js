"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const app_controller_1 = require("./app.controller");
const supabase_module_1 = require("./supabase/supabase.module");
const auth_module_1 = require("./components/auth.module");
const wallet_module_1 = require("./components/wallet/wallet.module");
const waste_module_1 = require("./components/waste/waste.module");
const rewards_module_1 = require("./rewards/rewards.module");
const config_module_1 = require("./config/config.module");
const config_service_1 = require("./config/config.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_module_1.ConfigModule,
            jwt_1.JwtModule.registerAsync({
                global: true,
                inject: [config_service_1.CustomConfigService],
                useFactory: (configService) => ({
                    secret: configService.jwt.secret,
                    signOptions: {
                        expiresIn: configService.jwt.expiresIn,
                    },
                }),
            }),
            platform_express_1.MulterModule.register({
                storage: (0, multer_1.diskStorage)({
                    destination: './uploads',
                    filename: (req, file, callback) => {
                        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                        callback(null, `${file.fieldname}-${uniqueSuffix}${(0, path_1.extname)(file.originalname)}`);
                    },
                }),
                limits: { fileSize: 5 * 1024 * 1024 },
            }),
            supabase_module_1.SupabaseModule,
            auth_module_1.AuthModule,
            wallet_module_1.WalletModule,
            waste_module_1.WasteModule,
            rewards_module_1.RewardsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map