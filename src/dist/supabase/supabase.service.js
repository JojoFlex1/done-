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
var SupabaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
let SupabaseService = SupabaseService_1 = class SupabaseService {
    constructor() {
        this.logger = new common_1.Logger(SupabaseService_1.name);
    }
    onModuleInit() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !serviceRoleKey) {
            this.logger.error('Missing Supabase configuration:', {
                hasUrl: !!supabaseUrl,
                hasServiceRoleKey: !!serviceRoleKey
            });
            throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
        }
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, serviceRoleKey);
        this.logger.log('Supabase client initialized');
    }
    getClient() {
        return this.supabase;
    }
    async createUser(userData) {
        try {
            const { data: existingUsersData } = await this.supabase.auth.admin.listUsers();
            const userExists = existingUsersData?.users?.find((user) => user.email === userData.email);
            let authUser;
            if (userExists) {
                this.logger.warn('Auth user already exists, using existing user');
                authUser = { user: userExists };
            }
            else {
                const { data, error: authError } = await this.supabase.auth.admin.createUser({
                    email: userData.email,
                    password: userData.password,
                    email_confirm: true,
                    user_metadata: {
                        username: userData.username,
                        first_name: userData.firstName,
                        last_name: userData.lastName,
                        email_verified: true,
                    },
                });
                if (authError) {
                    this.logger.error('Auth user creation failed:', authError);
                    throw authError;
                }
                authUser = data;
                this.logger.log(`Auth user created: ${authUser.user.id}`);
            }
            const { data: profile, error: profileError } = await this.supabase
                .from('profiles')
                .upsert({
                id: authUser.user.id,
                username: userData.username,
                first_name: userData.firstName,
                last_name: userData.lastName,
                wallet_address: userData.walletAddress,
                reward_address: userData.rewardAddress,
                encrypted_mnemonic: userData.encryptedMnemonic,
                total_points: 0,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'id',
                ignoreDuplicates: false,
            })
                .select()
                .single();
            if (profileError) {
                this.logger.error('Profile creation/update failed:', profileError);
                if (!userExists) {
                    this.logger.log('Cleaning up auth user...');
                    await this.supabase.auth.admin.deleteUser(authUser.user.id);
                }
                throw profileError;
            }
            this.logger.log('Profile created/updated successfully');
            return { user: authUser.user, profile };
        }
        catch (error) {
            this.logger.error('createUser failed:', error);
            throw error;
        }
    }
    async getUserByEmail(email) {
        const { data, error } = await this.supabase.auth.admin.listUsers();
        if (error)
            throw error;
        const user = data.users.find((u) => u.email === email);
        return user || null;
    }
    async getUserProfile(userId) {
        const { data, error } = await this.supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error)
            throw error;
        return data;
    }
    async createWasteSubmission(data) {
        const { data: submission, error } = await this.supabase
            .from('waste_submissions')
            .insert(data)
            .select()
            .single();
        if (error)
            throw error;
        return submission;
    }
    async getUserSubmissions(userId) {
        const { data, error } = await this.supabase
            .from('waste_submissions')
            .select('*, bins (id, name, address, latitude, longitude)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        return data || [];
    }
    async getBinByQR(qrCode) {
        const { data, error } = await this.supabase
            .from('bins')
            .select('*')
            .eq('qr_code', qrCode)
            .eq('status', 'active')
            .single();
        if (error)
            throw error;
        return data;
    }
    async getAllActiveBins() {
        const { data, error } = await this.supabase
            .from('bins')
            .select('*')
            .eq('status', 'active');
        if (error)
            throw error;
        return data || [];
    }
    async createPointTransaction(data) {
        const { data: transaction, error } = await this.supabase
            .from('point_transactions')
            .insert(data)
            .select()
            .single();
        if (error)
            throw error;
        return transaction;
    }
    async getUserTransactions(userId) {
        const { data, error } = await this.supabase
            .from('point_transactions')
            .select('*, waste_submissions (waste_type, bins (name))')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        return data || [];
    }
    async getUserTotalPoints(userId) {
        const { data, error } = await this.supabase
            .from('profiles')
            .select('total_points')
            .eq('id', userId)
            .single();
        if (error)
            throw error;
        return data?.total_points || 0;
    }
    async updateSubmissionWithBlockchainHash(submissionId, hash) {
        const { data, error } = await this.supabase
            .from('waste_submissions')
            .update({ blockchain_hash: hash })
            .eq('id', submissionId);
        if (error)
            throw error;
        return data;
    }
    async updateTransactionWithBlockchainHash(transactionId, hash) {
        const { data, error } = await this.supabase
            .from('point_transactions')
            .update({ blockchain_hash: hash })
            .eq('id', transactionId);
        if (error)
            throw error;
        return data;
    }
};
exports.SupabaseService = SupabaseService;
exports.SupabaseService = SupabaseService = SupabaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], SupabaseService);
//# sourceMappingURL=supabase.service.js.map