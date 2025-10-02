import { ConfigService } from '../config/config.service';
export declare class EmailService {
    private configService;
    private transporter;
    private readonly logger;
    constructor(configService: ConfigService);
    sendOTP(email: string, otp: string, firstName: string): Promise<void>;
    private getOTPEmailTemplate;
}
