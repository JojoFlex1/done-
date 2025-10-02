"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const auth_guard_1 = require("./auth.guard");
const email_service_1 = require("./email.service");
const supabase_module_1 = require("../supabase/supabase.module");
const wallet_module_1 = require("./wallet/wallet.module");
const config_service_1 = require("../config/config.service");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            supabase_module_1.SupabaseModule,
            wallet_module_1.WalletModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    secret: configService.jwt.secret,
                    signOptions: { expiresIn: configService.jwt.expiresIn },
                }),
                inject: [config_service_1.ConfigService],
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService, auth_guard_1.AuthGuard, email_service_1.EmailService, config_service_1.ConfigService],
        exports: [auth_service_1.AuthService, auth_guard_1.AuthGuard],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map