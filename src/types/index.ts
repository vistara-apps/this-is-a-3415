export interface HealthcareProvider {
  providerId: string;
  name: string;
  address: string;
  specialties: string[];
  insuranceAccepted: string[];
  slidingScale: boolean;
  phone?: string;
  website?: string;
}

export interface AidProgram {
  programId: string;
  name: string;
  description: string;
  eligibility: string[];
  applicationLink: string;
  category: string;
}

export interface CommunityResource {
  resourceId: string;
  name: string;
  type: string;
  address: string;
  contactInfo: string;
  services: string[];
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  searchResults?: {
    providers?: HealthcareProvider[];
    aidPrograms?: AidProgram[];
    resources?: CommunityResource[];
  };
}