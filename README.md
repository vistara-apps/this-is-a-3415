# HealthNavi 🏥

**Find Affordable Healthcare & Aid with AI Guidance**

HealthNavi is an AI-powered assistant that helps low-income individuals and families find affordable healthcare providers, understand their insurance, and access essential aid programs. Built as a Base Mini App with Farcaster integration.

![HealthNavi Screenshot](https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=HealthNavi+Screenshot)

## 🌟 Features

### Core Features
- **🤖 AI-Powered Provider Search**: Find local doctors, clinics, and hospitals accepting Medicaid or offering sliding scale fees
- **📋 Insurance Plan Explainer**: Simplify insurance plan details, coverage, deductibles, and co-pays
- **🎯 Aid Program Finder**: Discover and apply for government and non-profit assistance programs
- **🏠 Community Resource Locator**: Find free clinics, food banks, and essential community services

### Technical Features
- **🔗 Farcaster Integration**: Native Base Mini App with frame support
- **💾 Supabase Backend**: Scalable database with real-time capabilities
- **🧠 OpenAI Integration**: Advanced AI responses and natural language processing
- **📱 Responsive Design**: Works seamlessly on all devices
- **🔒 Privacy-First**: Secure user data handling with RLS policies

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account (for database)
- OpenAI API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vistara-apps/this-is-a-3415.git
   cd this-is-a-3415
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   VITE_BASE_RPC_URL=https://rpc.base.org
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
   ```

4. **Set up the database**
   - Create a new Supabase project
   - Run the SQL schema from `database/schema.sql` in your Supabase SQL editor
   - Enable Row Level Security (RLS) policies

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **AI**: OpenAI GPT-4 via OpenRouter
- **Blockchain**: Base network integration
- **Deployment**: Docker + Vercel/Netlify ready

### Project Structure
```
src/
├── components/          # React components
│   ├── ChatInterface.tsx
│   ├── FeatureCards.tsx
│   ├── ProviderCard.tsx
│   └── ...
├── services/           # API and business logic
│   ├── aiService.ts
│   ├── supabaseService.ts
│   └── farcasterService.ts
├── types/              # TypeScript definitions
├── data/               # Mock data and constants
└── App.tsx             # Main application component

database/
└── schema.sql          # Complete database schema

public/
└── ...                 # Static assets
```

## 🗄️ Database Schema

### Core Tables
- **users**: Farcaster user profiles and preferences
- **healthcare_providers**: Medical providers with specialties and insurance
- **aid_programs**: Government and non-profit assistance programs
- **community_resources**: Local support services and resources
- **user_queries**: Analytics and personalization data
- **user_favorites**: Saved items for users

### Key Features
- **Row Level Security (RLS)**: Secure data access
- **Full-text search**: Optimized search across all content
- **Geospatial indexing**: Location-based queries
- **JSONB fields**: Flexible data storage

## 🤖 AI Integration

### OpenAI Configuration
```typescript
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});
```

### AI Features
- **Intent Recognition**: Automatically categorizes user queries
- **Parameter Extraction**: Identifies specialty, insurance, location, urgency
- **Smart Filtering**: Prioritizes affordable and accessible options
- **Contextual Responses**: Empathetic, helpful, and actionable guidance

### Example Usage
```typescript
const result = await AIService.processQuery(
  "Find a pediatrician near me who accepts Medicaid",
  userId,
  { latitude: 40.7128, longitude: -74.0060 }
);
```

## 🔗 Farcaster Integration

### Frame Support
HealthNavi supports Farcaster frames for seamless social integration:

```typescript
// Generate frame metadata
const metadata = FarcasterService.generateFrameMetadata({
  title: 'HealthNavi - Find Healthcare',
  image: 'https://healthnavi.app/frame-image.png',
  buttons: [
    { label: '🏥 Find Providers', action: 'post' },
    { label: '💊 Aid Programs', action: 'post' }
  ]
});
```

### User Authentication
- Farcaster ID-based authentication
- Profile integration with preferences
- Query history and personalization

## 📊 API Documentation

### Healthcare Providers
```typescript
// Get providers with filters
const providers = await SupabaseService.getHealthcareProviders({
  specialty: 'Family Medicine',
  insurance: 'Medicaid',
  slidingScale: true
});

// Create new provider
const provider = await SupabaseService.createHealthcareProvider({
  name: 'Community Health Center',
  address: '123 Main St',
  specialties: ['Family Medicine'],
  insuranceAccepted: ['Medicaid'],
  slidingScale: true
});
```

### Aid Programs
```typescript
// Get aid programs by category
const programs = await SupabaseService.getAidPrograms({
  category: 'Food Assistance'
});
```

### Community Resources
```typescript
// Get resources by type and location
const resources = await SupabaseService.getCommunityResources({
  type: 'Food Bank',
  location: 'Springfield, IL'
});
```

## 🎨 Design System

### Color Palette
```css
:root {
  --primary: hsl(210, 80%, 50%);      /* Blue */
  --accent: hsl(130, 70%, 45%);       /* Green */
  --bg: hsl(210, 30%, 99%);           /* Light Gray */
  --surface: hsl(210, 30%, 95%);      /* Surface Gray */
  --text-primary: hsl(210, 30%, 10%); /* Dark Gray */
  --text-secondary: hsl(210, 30%, 40%); /* Medium Gray */
}
```

### Typography
- **Display**: `text-3xl font-bold`
- **Heading**: `text-xl font-semibold`
- **Body**: `text-base font-normal leading-relaxed`
- **Caption**: `text-sm font-normal`

### Components
- **AgentChat**: AI conversation interface
- **Card**: Content containers with shadow
- **Button**: Primary and secondary variants
- **Input**: Form input fields
- **ListItem**: Structured list display

## 🚀 Deployment

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### Environment Setup
1. Set up Supabase project and configure RLS policies
2. Configure OpenAI API key with appropriate rate limits
3. Set up domain for Farcaster frame integration
4. Configure CORS for API endpoints

### Production Checklist
- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] RLS policies enabled
- [ ] API rate limiting configured
- [ ] Error monitoring setup
- [ ] Analytics tracking enabled

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style
- Use TypeScript for all new code
- Follow the existing component patterns
- Add JSDoc comments for public APIs
- Use semantic commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.healthnavi.app](https://docs.healthnavi.app)
- **Issues**: [GitHub Issues](https://github.com/vistara-apps/this-is-a-3415/issues)
- **Discord**: [Join our community](https://discord.gg/healthnavi)
- **Email**: support@healthnavi.app

## 🙏 Acknowledgments

- **OpenAI** for AI capabilities
- **Supabase** for backend infrastructure
- **Farcaster** for social integration
- **Base** for blockchain infrastructure
- **Tailwind CSS** for styling system

---

**HealthNavi** - Empowering communities with accessible healthcare information 💙

Made with ❤️ for those who need it most.
