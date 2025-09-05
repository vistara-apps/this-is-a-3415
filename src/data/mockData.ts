import { HealthcareProvider, AidProgram, CommunityResource } from '../types';

export const mockProviders: HealthcareProvider[] = [
  {
    providerId: '1',
    name: 'Community Health Center',
    address: '123 Main St, Springfield, IL 62701',
    specialties: ['Family Medicine', 'Pediatrics'],
    insuranceAccepted: ['Medicaid', 'Medicare', 'Sliding Scale'],
    slidingScale: true,
    phone: '(555) 123-4567',
    website: 'https://communityhealthcenter.org'
  },
  {
    providerId: '2',
    name: 'Free Clinic of Springfield',
    address: '456 Oak Ave, Springfield, IL 62702',
    specialties: ['General Medicine', 'Mental Health'],
    insuranceAccepted: ['Uninsured', 'Sliding Scale'],
    slidingScale: true,
    phone: '(555) 987-6543'
  },
  {
    providerId: '3',
    name: 'Springfield Dental Care',
    address: '789 Elm St, Springfield, IL 62703',
    specialties: ['General Dentistry', 'Oral Surgery'],
    insuranceAccepted: ['Medicaid', 'Delta Dental', 'Sliding Scale'],
    slidingScale: true,
    phone: '(555) 456-7890'
  }
];

export const mockAidPrograms: AidProgram[] = [
  {
    programId: '1',
    name: 'SNAP (Food Stamps)',
    description: 'Supplemental Nutrition Assistance Program provides monthly benefits to buy groceries',
    eligibility: ['Income below 130% of federal poverty level', 'US citizenship or eligible immigrant'],
    applicationLink: 'https://www.fns.usda.gov/snap',
    category: 'Food Assistance'
  },
  {
    programId: '2',
    name: 'LIHEAP (Energy Assistance)',
    description: 'Low Income Home Energy Assistance Program helps with heating and cooling costs',
    eligibility: ['Income below 150% of federal poverty level', 'Received shut-off notice'],
    applicationLink: 'https://www.acf.hhs.gov/ocs/programs/liheap',
    category: 'Utility Assistance'
  },
  {
    programId: '3',
    name: 'GoodRx Prescription Discounts',
    description: 'Free prescription discount program offering up to 80% off medications',
    eligibility: ['No income requirements', 'Available to all US residents'],
    applicationLink: 'https://www.goodrx.com',
    category: 'Prescription Assistance'
  }
];

export const mockResources: CommunityResource[] = [
  {
    resourceId: '1',
    name: 'Springfield Food Bank',
    type: 'Food Bank',
    address: '321 Charity Ln, Springfield, IL 62704',
    contactInfo: '(555) 111-2222',
    services: ['Emergency food boxes', 'Free meals', 'Nutrition education']
  },
  {
    resourceId: '2',
    name: 'Hope Shelter',
    type: 'Homeless Shelter',
    address: '654 Hope St, Springfield, IL 62705',
    contactInfo: '(555) 333-4444',
    services: ['Emergency housing', 'Case management', 'Job training']
  },
  {
    resourceId: '3',
    name: 'Salvation Army Thrift Store',
    type: 'Clothing Assistance',
    address: '987 Donation Dr, Springfield, IL 62706',
    contactInfo: '(555) 555-6666',
    services: ['Free clothing vouchers', 'Household items', 'Emergency assistance']
  }
];