# HealthNavi Deployment Guide

This guide covers deploying HealthNavi to production environments with all necessary configurations.

## 🚀 Quick Deploy Options

### Option 1: Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vistara-apps/this-is-a-3415)

### Option 2: Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/vistara-apps/this-is-a-3415)

### Option 3: Docker
```bash
docker build -t healthnavi .
docker run -p 3000:3000 healthnavi
```

## 📋 Prerequisites

### Required Services
1. **Supabase Project** - Database and authentication
2. **OpenAI API Key** - AI functionality
3. **Domain Name** - For Farcaster frame integration
4. **Google Maps API Key** (Optional) - Location services

### Optional Services
- **Stripe Account** - Future payment processing
- **Sentry** - Error monitoring
- **Google Analytics** - Usage analytics

## 🔧 Environment Configuration

### Production Environment Variables
```env
# Core Application
VITE_OPENAI_API_KEY=sk-...
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Farcaster Integration
VITE_FRAME_BASE_URL=https://healthnavi.app

# Location Services (Optional)
VITE_GOOGLE_MAPS_API_KEY=AIza...

# Blockchain (Optional)
VITE_BASE_RPC_URL=https://rpc.base.org

# Payments (Future)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Monitoring (Optional)
VITE_SENTRY_DSN=https://...
VITE_GA_TRACKING_ID=G-...
```

## 🗄️ Database Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 2. Run Database Schema
1. Open Supabase SQL Editor
2. Copy and paste the contents of `database/schema.sql`
3. Execute the script

### 3. Configure Row Level Security
The schema automatically sets up RLS policies, but verify:
- Public read access for healthcare data
- User-specific access for personal data
- Secure API key handling

### 4. Set up Storage (Optional)
If you plan to store images or files:
```sql
-- Create storage bucket for user uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);

-- Create policy for authenticated uploads
CREATE POLICY "Users can upload files" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

## 🤖 AI Service Configuration

### OpenAI Setup
1. Get API key from [OpenAI](https://platform.openai.com)
2. Set up billing and usage limits
3. Configure rate limiting in your deployment

### Model Configuration
The app uses `google/gemini-2.0-flash-001` via OpenRouter:
- Cost-effective for high volume
- Good performance for healthcare queries
- Fallback to OpenAI GPT-4 if needed

## 🔗 Farcaster Frame Setup

### 1. Domain Configuration
- Set `VITE_FRAME_BASE_URL` to your production domain
- Ensure HTTPS is enabled
- Configure CORS for frame endpoints

### 2. Frame Endpoints
Create these API endpoints for frame functionality:
```
/api/frame/welcome - Initial frame
/api/frame/action - Handle button clicks
/api/frame/providers - Provider search frame
/api/frame/aid - Aid programs frame
/api/frame/resources - Resources frame
/api/frame/ai-response - AI response frame
```

### 3. Frame Images
Generate dynamic images for frames:
- Welcome screen with branding
- Search results visualization
- AI response formatting
- Error handling screens

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  healthnavi:
    build: .
    ports:
      - "3000:80"
    environment:
      - VITE_SUPABASE_URL=${SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - VITE_OPENAI_API_KEY=${OPENAI_API_KEY}
    restart: unless-stopped
```

## ☁️ Cloud Platform Deployment

### Vercel Deployment
1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Configure build settings:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "installCommand": "npm install"
   }
   ```

### Netlify Deployment
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables

### AWS/GCP/Azure
For cloud platforms, use the Docker image or static build:
1. Build the application: `npm run build`
2. Upload `dist/` folder to your hosting service
3. Configure environment variables
4. Set up CDN and SSL

## 🔒 Security Configuration

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://openrouter.ai;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://openrouter.ai https://*.supabase.co;
  frame-ancestors 'none';
">
```

### CORS Configuration
For API endpoints:
```javascript
const corsOptions = {
  origin: ['https://healthnavi.app', 'https://warpcast.com'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

## 📊 Monitoring & Analytics

### Error Monitoring with Sentry
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
});
```

### Analytics with Google Analytics
```typescript
import { gtag } from 'ga-gtag';

gtag('config', import.meta.env.VITE_GA_TRACKING_ID, {
  page_title: 'HealthNavi',
  page_location: window.location.href,
});
```

### Health Checks
Create health check endpoints:
```typescript
// /api/health
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build application
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          VITE_OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📈 Performance Optimization

### Build Optimization
```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ai: ['openai'],
          ui: ['lucide-react']
        }
      }
    }
  }
});
```

### Caching Strategy
- Static assets: 1 year cache
- API responses: 5 minutes cache
- Database queries: Smart caching with invalidation

## 🚨 Troubleshooting

### Common Issues

1. **Supabase Connection Errors**
   - Verify URL and API key
   - Check RLS policies
   - Ensure database schema is applied

2. **OpenAI API Errors**
   - Check API key validity
   - Verify rate limits
   - Monitor usage quotas

3. **Farcaster Frame Issues**
   - Ensure HTTPS is enabled
   - Verify frame metadata format
   - Check CORS configuration

4. **Build Failures**
   - Clear node_modules and reinstall
   - Check environment variables
   - Verify TypeScript configuration

### Debug Mode
Enable debug logging:
```env
VITE_DEBUG=true
VITE_LOG_LEVEL=debug
```

## 📞 Support

For deployment issues:
- Check the [GitHub Issues](https://github.com/vistara-apps/this-is-a-3415/issues)
- Join our [Discord community](https://discord.gg/healthnavi)
- Email: support@healthnavi.app

## ✅ Post-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database schema applied and RLS enabled
- [ ] SSL certificate installed
- [ ] Domain configured for Farcaster frames
- [ ] Health checks passing
- [ ] Error monitoring active
- [ ] Analytics tracking enabled
- [ ] Performance monitoring setup
- [ ] Backup strategy implemented
- [ ] Security headers configured

---

🎉 **Congratulations!** HealthNavi is now deployed and ready to help users find affordable healthcare and assistance programs.
