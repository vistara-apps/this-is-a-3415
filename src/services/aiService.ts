import { OpenAI } from 'openai';
import { HealthcareProvider, AidProgram, CommunityResource } from '../types';
import { mockProviders, mockAidPrograms, mockResources } from '../data/mockData';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'demo-key',
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
});

export class AIService {
  static async processQuery(query: string): Promise<{
    response: string;
    searchResults?: {
      providers?: HealthcareProvider[];
      aidPrograms?: AidProgram[];
      resources?: CommunityResource[];
    };
  }> {
    try {
      // Analyze query intent
      const intent = this.analyzeIntent(query);
      
      // Get relevant data based on intent
      const searchResults = this.getRelevantData(query, intent);
      
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
              When presenting search results, briefly explain what you found and highlight the most relevant options.`
            },
            {
              role: "user",
              content: `User query: "${query}"\n\nAvailable data: ${JSON.stringify(searchResults, null, 2)}\n\nPlease provide a helpful response.`
            }
          ],
          max_tokens: 300,
        });
        
        response = completion.choices[0]?.message?.content || this.getDefaultResponse(intent, searchResults);
      } else {
        response = this.getDefaultResponse(intent, searchResults);
      }

      return { response, searchResults };
    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        response: "I'm here to help you find affordable healthcare and assistance programs. You can ask me about finding doctors who accept Medicaid, aid programs you might qualify for, or community resources in your area.",
        searchResults: undefined
      };
    }
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

  private static getRelevantData(query: string, intent: string) {
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
        // For general queries, return a mix of all types
        results.providers = mockProviders.slice(0, 2);
        results.aidPrograms = mockAidPrograms.slice(0, 2);
        results.resources = mockResources.slice(0, 2);
    }
    
    return results;
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