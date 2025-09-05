import { createClient } from '@supabase/supabase-js';
import { HealthcareProvider, AidProgram, CommunityResource } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export class SupabaseService {
  // Healthcare Providers
  static async getHealthcareProviders(filters?: {
    specialty?: string;
    insurance?: string;
    location?: string;
    slidingScale?: boolean;
  }): Promise<HealthcareProvider[]> {
    try {
      let query = supabase.from('healthcare_providers').select('*');
      
      if (filters?.specialty) {
        query = query.contains('specialties', [filters.specialty]);
      }
      
      if (filters?.insurance) {
        query = query.contains('insurance_accepted', [filters.insurance]);
      }
      
      if (filters?.slidingScale) {
        query = query.eq('sliding_scale', filters.slidingScale);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data?.map(provider => ({
        providerId: provider.id,
        name: provider.name,
        address: provider.address,
        specialties: provider.specialties || [],
        insuranceAccepted: provider.insurance_accepted || [],
        slidingScale: provider.sliding_scale || false,
        phone: provider.phone,
        website: provider.website
      })) || [];
    } catch (error) {
      console.error('Error fetching healthcare providers:', error);
      return [];
    }
  }

  static async createHealthcareProvider(provider: Omit<HealthcareProvider, 'providerId'>): Promise<HealthcareProvider | null> {
    try {
      const { data, error } = await supabase
        .from('healthcare_providers')
        .insert({
          name: provider.name,
          address: provider.address,
          specialties: provider.specialties,
          insurance_accepted: provider.insuranceAccepted,
          sliding_scale: provider.slidingScale,
          phone: provider.phone,
          website: provider.website
        })
        .select()
        .single();

      if (error) throw error;

      return {
        providerId: data.id,
        name: data.name,
        address: data.address,
        specialties: data.specialties || [],
        insuranceAccepted: data.insurance_accepted || [],
        slidingScale: data.sliding_scale || false,
        phone: data.phone,
        website: data.website
      };
    } catch (error) {
      console.error('Error creating healthcare provider:', error);
      return null;
    }
  }

  // Aid Programs
  static async getAidPrograms(filters?: {
    category?: string;
    eligibilityKeywords?: string[];
  }): Promise<AidProgram[]> {
    try {
      let query = supabase.from('aid_programs').select('*');
      
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data?.map(program => ({
        programId: program.id,
        name: program.name,
        description: program.description,
        eligibility: program.eligibility || [],
        applicationLink: program.application_link,
        category: program.category
      })) || [];
    } catch (error) {
      console.error('Error fetching aid programs:', error);
      return [];
    }
  }

  static async createAidProgram(program: Omit<AidProgram, 'programId'>): Promise<AidProgram | null> {
    try {
      const { data, error } = await supabase
        .from('aid_programs')
        .insert({
          name: program.name,
          description: program.description,
          eligibility: program.eligibility,
          application_link: program.applicationLink,
          category: program.category
        })
        .select()
        .single();

      if (error) throw error;

      return {
        programId: data.id,
        name: data.name,
        description: data.description,
        eligibility: data.eligibility || [],
        applicationLink: data.application_link,
        category: data.category
      };
    } catch (error) {
      console.error('Error creating aid program:', error);
      return null;
    }
  }

  // Community Resources
  static async getCommunityResources(filters?: {
    type?: string;
    location?: string;
    services?: string[];
  }): Promise<CommunityResource[]> {
    try {
      let query = supabase.from('community_resources').select('*');
      
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      
      if (filters?.services && filters.services.length > 0) {
        query = query.overlaps('services', filters.services);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data?.map(resource => ({
        resourceId: resource.id,
        name: resource.name,
        type: resource.type,
        address: resource.address,
        contactInfo: resource.contact_info,
        services: resource.services || []
      })) || [];
    } catch (error) {
      console.error('Error fetching community resources:', error);
      return [];
    }
  }

  static async createCommunityResource(resource: Omit<CommunityResource, 'resourceId'>): Promise<CommunityResource | null> {
    try {
      const { data, error } = await supabase
        .from('community_resources')
        .insert({
          name: resource.name,
          type: resource.type,
          address: resource.address,
          contact_info: resource.contactInfo,
          services: resource.services
        })
        .select()
        .single();

      if (error) throw error;

      return {
        resourceId: data.id,
        name: data.name,
        type: data.type,
        address: data.address,
        contactInfo: data.contact_info,
        services: data.services || []
      };
    } catch (error) {
      console.error('Error creating community resource:', error);
      return null;
    }
  }

  // User Management
  static async createUser(userData: {
    farcasterId: string;
    preferences?: Record<string, any>;
  }) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          farcaster_id: userData.farcasterId,
          preferences: userData.preferences || {},
          queries_history: []
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  static async getUserByFarcasterId(farcasterId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('farcaster_id', farcasterId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  static async updateUserQueryHistory(userId: string, query: string) {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('queries_history')
        .eq('id', userId)
        .single();

      const updatedHistory = [...(user?.queries_history || []), {
        query,
        timestamp: new Date().toISOString()
      }].slice(-50); // Keep last 50 queries

      const { error } = await supabase
        .from('users')
        .update({ queries_history: updatedHistory })
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating user query history:', error);
      return false;
    }
  }
}
