import { ConfigService as NestConfigService } from '@nestjs/config';
export declare class CustomConfigService {
    private configService;
    constructor(configService: NestConfigService);
    get supabase(): {
        url: string;
        anonKey: string;
        serviceRoleKey: string;
    };
    get jwt(): {
        secret: string;
        expiresIn: string;
    };
    get email(): {
        host: string;
        port: number;
        user: string;
        password: string;
        from: string;
    };
    get cardano(): {
        network: string;
    };
    get encryption(): {
        key: string;
    };
    get upload(): {
        path: string;
        maxFileSize: number;
    };
    get urls(): {
        backend: string;
        frontend: string;
        corsOrigin: string;
    };
    get treasury(): {
        contractAddress: string;
        mnemonic: string;
    };
    get<T = string>(key: string, defaultValue?: T): T;
}
export { CustomConfigService as ConfigService };
