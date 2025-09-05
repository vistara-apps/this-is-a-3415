import { OpenAI } from 'openai';
import { HealthcareProvider, AidProgram, CommunityResource } from '../types';
import { mockProviders, mockAidPrograms, mockResources } from '../data/mockData';
import { SupabaseService } from './supabaseService';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'demo-key',
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
});

export class AIService {
  static async processQuery(
    query: string, 
    userId?: string,
    location?: { latitude: number; longitude: number }
  ): Promise<{
    response: string;
    searchResults?: {
      providers?: HealthcareProvider[];
      aidPrograms?: AidProgram[];
      resources?: CommunityResource[];
    };
  }> {
    try {
      // Analyze query intent and extract parameters
      const intent = this.analyzeIntent(query);
      const queryParams = this.extractQueryParameters(query);
      
      // Get relevant data from Supabase or fallback to mock data
      const searchResults = await this.getRelevantData(query, intent, queryParams, location);
      
      // Log user query for analytics (if user is logged in)
      if (userId) {
        await this.logUserQuery(userId, query, intent, searchResults);
      }
      
      // Generate AI response if API key is available
      let response = '';
      if (import.meta.env.VITE_OPENAI_API_KEY && import.meta.env.VITE_OPENAI_API_KEY !== 'demo-key') {
        const completion = await openai.chat.completions.create({
          model: "google/gemini-2.0-flash-001",
          messages: [
            {
              role: "system",
              content: `You are HealthNavi, an AI assistant helping low-income individuals find affordable healthcare and aid. 
              Be empathetic, helpful, and provide clear, actionable information. Focus on affordability and accessibility.
              When presenting search results, briefly explain what you found and highlight the most relevant options.
              Always emphasize free or low-cost options first. Be encouraging and supportive in your tone.
              If location is mentioned, prioritize geographically relevant results.`
            },
            {
              role: "user",
              content: `User query: "${query}"\n\nQuery parameters: ${JSON.stringify(queryParams)}\n\nAvailable data: ${JSON.stringify(searchResults, null, 2)}\n\nPlease provide a helpful, empathetic response that prioritizes the most affordable and accessible options.`
            }
          ],
          max_tokens: 400,
          temperature: 0.7,
        });
        
        response = completion.choices[0]?.message?.content || this.getDefaultResponse(intent, searchResults);
      } else {
        response = this.getDefaultResponse(intent, searchResults);
      }

      return { response, searchResults };
    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        response: "I'm here to help you find affordable healthcare and assistance programs. You can ask me about finding doctors who accept Medicaid, aid programs you might qualify for, or community resources in your area. Please try rephrasing your question, and I'll do my best to help!",
        searchResults: undefined
      };
    }
  }

  private static async logUserQuery(
    userId: string, 
    query: string, 
    intent: string, 
    searchResults: any
  ) {
    try {
      const resultsCount = (searchResults.providers?.length || 0) + 
                          (searchResults.aidPrograms?.length || 0) + 
                          (searchResults.resources?.length || 0);
      
      // This would be implemented with Supabase when available
      // For now, we'll just log to console
      console.log('User Query Logged:', {
        userId,
        query,
        intent,
        resultsCount,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error logging user query:', error);
    }
  }

  private static extractQueryParameters(query: string): {
    specialty?: string;
    insurance?: string;
    location?: string;
    urgency?: 'emergency' | 'urgent' | 'routine';
    ageGroup?: 'child' | 'adult' | 'senior';
  } {
    const lowerQuery = query.toLowerCase();
    const params: any = {};

    // Extract specialty
    const specialties = ['pediatric', 'dental', 'mental health', 'cardiology', 'dermatology', 'orthopedic', 'gynecology', 'family medicine'];
    for (const specialty of specialties) {
      if (lowerQuery.includes(specialty)) {
        params.specialty = specialty;
        break;
      }
    }

    // Extract insurance type
    const insuranceTypes = ['medicaid', 'medicare', 'uninsured', 'sliding scale'];
    for (const insurance of insuranceTypes) {
      if (lowerQuery.includes(insurance)) {
        params.insurance = insurance;
        break;
      }
    }

    // Extract urgency
    if (lowerQuery.includes('emergency') || lowerQuery.includes('urgent')) {
      params.urgency = 'emergency';
    } else if (lowerQuery.includes('soon') || lowerQuery.includes('asap')) {
      params.urgency = 'urgent';
    } else {
      params.urgency = 'routine';
    }

    // Extract age group
    if (lowerQuery.includes('child') || lowerQuery.includes('kid') || lowerQuery.includes('pediatric')) {
      params.ageGroup = 'child';
    } else if (lowerQuery.includes('senior') || lowerQuery.includes('elderly')) {
      params.ageGroup = 'senior';
    } else {
      params.ageGroup = 'adult';
    }

    return params;
  }

  private static analyzeIntent(query: string): 'provider' | 'aid' | 'resource' | 'insurance' | 'general' {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('doctor') || lowerQuery.includes('clinic') || lowerQuery.includes('hospital') || 
        lowerQuery.includes('dentist') || lowerQuery.includes('provider') || lowerQuery.includes('medicaid')) {
      return 'provider';
    }
    
    if (lowerQuery.includes('snap') || lowerQuery.includes('food stamp') || lowerQuery.includes('liheap') ||
        lowerQuery.includes('assistance') || lowerQuery.includes('program') || lowerQuery.includes('help')) {
      return 'aid';
    }
    
    if (lowerQuery.includes('food bank') || lowerQuery.includes('shelter') || lowerQuery.includes('community') ||
        lowerQuery.includes('resource') || lowerQuery.includes('free')) {
      return 'resource';
    }
    
    if (lowerQuery.includes('insurance') || lowerQuery.includes('coverage') || lowerQuery.includes('deductible') ||
        lowerQuery.includes('copay')) {
      return 'insurance';
    }
    
    return 'general';
  }

  private static async getRelevantData(
    query: string, 
    intent: string, 
    queryParams: any,
    location?: { latitude: number; longitude: number }
  ) {
    const results: any = {};
    
    try {
      // Try to get data from Supabase first, fallback to mock data
      const useSupabase = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      switch (intent) {
        case 'provider':
          if (useSupabase) {
            results.providers = await SupabaseService.getHealthcareProviders({
              specialty: queryParams.specialty,
              insurance: queryParams.insurance,
              slidingScale: queryParams.insurance === 'uninsured' ? true : undefined
            });
          } else {
            results.providers = mockProviders.filter(provider => 
              this.matchesQuery(query, [provider.name, ...provider.specialties, ...provider.insuranceAccepted])
            );
          }
          
          // Prioritize sliding scale providers for uninsured users
          if (queryParams.insurance === 'uninsured' || query.toLowerCase().includes('uninsured')) {
            results.providers = results.providers.filter((p: HealthcareProvider) => p.slidingScale);
          }
          break;
          
        case 'aid':
          if (useSupabase) {
            results.aidPrograms = await SupabaseService.getAidPrograms({
              category: this.mapQueryToCategory(query)
            });
          } else {
            results.aidPrograms = mockAidPrograms.filter(program =>
              this.matchesQuery(query, [program.name, program.description, program.category])
            );
          }
          break;
          
        case 'resource':
          if (useSupabase) {
            results.resources = await SupabaseService.getCommunityResources({
              type: this.mapQueryToResourceType(query)
            });
          } else {
            results.resources = mockResources.filter(resource =>
              this.matchesQuery(query, [resource.name, resource.type, ...resource.services])
            );
          }
          break;
          
        default:
          // For general queries, return a mix of all types
          if (useSupabase) {
            const [providers, aidPrograms, resources] = await Promise.all([
              SupabaseService.getHealthcareProviders({}),
              SupabaseService.getAidPrograms({}),
              SupabaseService.getCommunityResources({})
            ]);
            results.providers = providers.slice(0, 2);
            results.aidPrograms = aidPrograms.slice(0, 2);
            results.resources = resources.slice(0, 2);
          } else {
            results.providers = mockProviders.slice(0, 2);
            results.aidPrograms = mockAidPrograms.slice(0, 2);
            results.resources = mockResources.slice(0, 2);
          }
      }
      
      // Sort results by relevance and affordability
      if (results.providers) {
        results.providers = this.sortProvidersByAffordability(results.providers);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to mock data on error
      return this.getMockData(query, intent);
    }
    
    return results;
  }

  private static getMockData(query: string, intent: string) {
    const results: any = {};
    
    switch (intent) {
      case 'provider':
        results.providers = mockProviders.filter(provider => 
          this.matchesQuery(query, [provider.name, ...provider.specialties, ...provider.insuranceAccepted])
        );
        break;
        
      case 'aid':
        results.aidPrograms = mockAidPrograms.filter(program =>
          this.matchesQuery(query, [program.name, program.description, program.category])
        );
        break;
        
      case 'resource':
        results.resources = mockResources.filter(resource =>
          this.matchesQuery(query, [resource.name, resource.type, ...resource.services])
        );
        break;
        
      default:
        results.providers = mockProviders.slice(0, 2);
        results.aidPrograms = mockAidPrograms.slice(0, 2);
        results.resources = mockResources.slice(0, 2);
    }
    
    return results;
  }

  private static mapQueryToCategory(query: string): string | undefined {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('food') || lowerQuery.includes('snap') || lowerQuery.includes('nutrition')) {
      return 'Food Assistance';
    }
    if (lowerQuery.includes('energy') || lowerQuery.includes('utility') || lowerQuery.includes('heating')) {
      return 'Utility Assistance';
    }
    if (lowerQuery.includes('prescription') || lowerQuery.includes('medication') || lowerQuery.includes('drug')) {
      return 'Prescription Assistance';
    }
    if (lowerQuery.includes('health') || lowerQuery.includes('medical') || lowerQuery.includes('insurance')) {
      return 'Health Insurance';
    }
    
    return undefined;
  }

  private static mapQueryToResourceType(query: string): string | undefined {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('food') || lowerQuery.includes('meal')) {
      return 'Food Bank';
    }
    if (lowerQuery.includes('shelter') || lowerQuery.includes('housing')) {
      return 'Homeless Shelter';
    }
    if (lowerQuery.includes('clothing') || lowerQuery.includes('clothes')) {
      return 'Clothing Assistance';
    }
    
    return undefined;
  }

  private static sortProvidersByAffordability(providers: HealthcareProvider[]): HealthcareProvider[] {
    return providers.sort((a, b) => {
      // Prioritize sliding scale providers
      if (a.slidingScale && !b.slidingScale) return -1;
      if (!a.slidingScale && b.slidingScale) return 1;
      
      // Then prioritize Medicaid acceptance
      const aMedicaid = a.insuranceAccepted.includes('Medicaid');
      const bMedicaid = b.insuranceAccepted.includes('Medicaid');
      if (aMedicaid && !bMedicaid) return -1;
      if (!aMedicaid && bMedicaid) return 1;
      
      return 0;
    });
  }

  private static matchesQuery(query: string, searchFields: string[]): boolean {
    const queryWords = query.toLowerCase().split(' ');
    const searchText = searchFields.join(' ').toLowerCase();
    
    return queryWords.some(word => 
      word.length > 2 && searchText.includes(word)
    );
  }

  private static getDefaultResponse(intent: string, searchResults: any): string {
    switch (intent) {
      case 'provider':
        return `I found ${searchResults.providers?.length || 0} healthcare providers that might help you. Look for those that accept Medicaid or offer sliding scale fees to keep costs low.`;
        
      case 'aid':
        return `Here are ${searchResults.aidPrograms?.length || 0} assistance programs that might be available to you. Check the eligibility requirements to see which ones you qualify for.`;
        
      case 'resource':
        return `I found ${searchResults.resources?.length || 0} community resources in your area. These services are typically free or low-cost and can provide immediate help.`;
        
      case 'insurance':
        return "Understanding your insurance can be confusing. Here are some key points: Medicaid covers many services at low or no cost. Always check if a provider accepts your insurance before scheduling. Look for community health centers that offer sliding scale fees based on your income.";
        
      default:
        return "I'm here to help you find affordable healthcare options, understand assistance programs, and locate community resources. What specific help are you looking for today?";
    }
  }
}
