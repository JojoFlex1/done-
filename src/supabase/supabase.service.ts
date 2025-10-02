import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(SupabaseService.name);

  constructor() {}

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
    
    this.supabase = createClient(supabaseUrl, serviceRoleKey);
    this.logger.log('Supabase client initialized');
  }

  getClient() {
    return this.supabase;
  }

  async createUser(userData: {
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName: string;
    walletAddress: string;
    rewardAddress: string;
    encryptedMnemonic: string;
  }) {
    try {
      // First, check if user already exists in auth
      const { data: existingUsersData } = await this.supabase.auth.admin.listUsers();
      const userExists = existingUsersData?.users?.find(
        (user) => user.email === userData.email // Fixed: was u.email
      );
      
      let authUser;
      
      if (userExists) {
        this.logger.warn('Auth user already exists, using existing user');
        authUser = { user: userExists };
      } else {
        // Create user in Supabase Auth
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
      
      // UPSERT profile instead of checking if exists
      // This will INSERT if new, or UPDATE if exists
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
        
        // If profile creation fails and we just created the auth user, clean it up
        if (!userExists) {
          this.logger.log('Cleaning up auth user...');
          await this.supabase.auth.admin.deleteUser(authUser.user.id);
        }
        
        throw profileError;
      }
      
      this.logger.log('Profile created/updated successfully');
      return { user: authUser.user, profile };
      
    } catch (error) {
      this.logger.error('createUser failed:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string) {
    const { data, error } = await this.supabase.auth.admin.listUsers();
    if (error) throw error;
    
    const user = data.users.find((u: any) => u.email === email);
    return user || null;
  }

  async getUserProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  }

  async createWasteSubmission(data: any) {
    const { data: submission, error } = await this.supabase
      .from('waste_submissions')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return submission;
  }

  async getUserSubmissions(userId: string) {
    const { data, error } = await this.supabase
      .from('waste_submissions')
      .select('*, bins (id, name, address, latitude, longitude)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getBinByQR(qrCode: string) {
    const { data, error } = await this.supabase
      .from('bins')
      .select('*')
      .eq('qr_code', qrCode)
      .eq('status', 'active')
      .single();
    if (error) throw error;
    return data;
  }

  async getAllActiveBins() {
    const { data, error } = await this.supabase
      .from('bins')
      .select('*')
      .eq('status', 'active');
    if (error) throw error;
    return data || [];
  }

  async createPointTransaction(data: any) {
    const { data: transaction, error } = await this.supabase
      .from('point_transactions')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return transaction;
  }

  async getUserTransactions(userId: string) {
    const { data, error } = await this.supabase
      .from('point_transactions')
      .select('*, waste_submissions (waste_type, bins (name))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getUserTotalPoints(userId: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('total_points')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data?.total_points || 0;
  }

  async updateSubmissionWithBlockchainHash(submissionId: string, hash: string) {
    const { data, error } = await this.supabase
      .from('waste_submissions')
      .update({ blockchain_hash: hash })
      .eq('id', submissionId);
    if (error) throw error;
    return data;
  }

  async updateTransactionWithBlockchainHash(transactionId: string, hash: string) {
    const { data, error } = await this.supabase
      .from('point_transactions')
      .update({ blockchain_hash: hash })
      .eq('id', transactionId);
    if (error) throw error;
    return data;
  }
}
