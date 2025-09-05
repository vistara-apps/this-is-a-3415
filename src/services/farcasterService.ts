// Farcaster Integration Service for Base Mini App
// This service handles Farcaster frame interactions and user authentication

export interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl?: string;
  verifications?: string[];
}

export interface FrameActionData {
  untrustedData: {
    fid: number;
    url: string;
    messageHash: string;
    timestamp: number;
    network: number;
    buttonIndex: number;
    inputText?: string;
    castId?: {
      fid: number;
      hash: string;
    };
  };
  trustedData: {
    messageBytes: string;
  };
}

export class FarcasterService {
  private static readonly FRAME_BASE_URL = import.meta.env.VITE_FRAME_BASE_URL || 'https://healthnavi.app';
  
  /**
   * Validates a Farcaster frame action
   */
  static async validateFrameAction(actionData: FrameActionData): Promise<boolean> {
    try {
      // In a real implementation, you would validate the signature
      // using the Farcaster Hub API or a validation service
      
      // For now, we'll do basic validation
      const { untrustedData } = actionData;
      
      if (!untrustedData.fid || !untrustedData.messageHash) {
        return false;
      }
      
      // Check if timestamp is recent (within last 5 minutes)
      const now = Math.floor(Date.now() / 1000);
      const timeDiff = now - untrustedData.timestamp;
      
      if (timeDiff > 300) { // 5 minutes
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error validating frame action:', error);
      return false;
    }
  }

  /**
   * Gets user information from Farcaster ID
   */
  static async getUserInfo(fid: number): Promise<FarcasterUser | null> {
    try {
      // In a real implementation, you would fetch from Farcaster Hub API
      // For now, we'll return mock data
      
      return {
        fid,
        username: `user${fid}`,
        displayName: `User ${fid}`,
        pfpUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fid}`,
        verifications: []
      };
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  }

  /**
   * Generates frame metadata for HTML responses
   */
  static generateFrameMetadata(options: {
    title: string;
    image: string;
    buttons?: Array<{
      label: string;
      action?: 'post' | 'post_redirect' | 'link';
      target?: string;
    }>;
    inputText?: string;
    postUrl?: string;
  }): string {
    const { title, image, buttons = [], inputText, postUrl } = options;
    
    let metadata = `
      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:title" content="${title}" />
      <meta property="fc:frame:image" content="${image}" />
      <meta property="og:image" content="${image}" />
      <meta property="og:title" content="${title}" />
    `;

    if (inputText) {
      metadata += `<meta property="fc:frame:input:text" content="${inputText}" />`;
    }

    if (postUrl) {
      metadata += `<meta property="fc:frame:post_url" content="${postUrl}" />`;
    }

    buttons.forEach((button, index) => {
      const buttonIndex = index + 1;
      metadata += `<meta property="fc:frame:button:${buttonIndex}" content="${button.label}" />`;
      
      if (button.action) {
        metadata += `<meta property="fc:frame:button:${buttonIndex}:action" content="${button.action}" />`;
      }
      
      if (button.target) {
        metadata += `<meta property="fc:frame:button:${buttonIndex}:target" content="${button.target}" />`;
      }
    });

    return metadata;
  }

  /**
   * Creates the initial frame for HealthNavi
   */
  static createInitialFrame(): string {
    const metadata = this.generateFrameMetadata({
      title: 'HealthNavi - Find Affordable Healthcare',
      image: `${this.FRAME_BASE_URL}/api/frame/welcome`,
      buttons: [
        { label: '🏥 Find Providers', action: 'post' },
        { label: '💊 Aid Programs', action: 'post' },
        { label: '🏠 Resources', action: 'post' },
        { label: '❓ Ask AI', action: 'post' }
      ],
      postUrl: `${this.FRAME_BASE_URL}/api/frame/action`
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          ${metadata}
          <title>HealthNavi - Find Affordable Healthcare & Aid with AI Guidance</title>
        </head>
        <body>
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif;">
            <h1>HealthNavi</h1>
            <p>Find Affordable Healthcare & Aid with AI Guidance</p>
            <p>Click a button above to get started!</p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Handles frame actions and returns appropriate responses
   */
  static async handleFrameAction(actionData: FrameActionData): Promise<string> {
    try {
      const isValid = await this.validateFrameAction(actionData);
      if (!isValid) {
        return this.createErrorFrame('Invalid frame action');
      }

      const { buttonIndex, inputText, fid } = actionData.untrustedData;
      const user = await this.getUserInfo(fid);

      switch (buttonIndex) {
        case 1: // Find Providers
          return this.createProviderSearchFrame(user);
        
        case 2: // Aid Programs
          return this.createAidProgramsFrame(user);
        
        case 3: // Resources
          return this.createResourcesFrame(user);
        
        case 4: // Ask AI
          if (inputText) {
            return await this.createAIResponseFrame(inputText, user);
          } else {
            return this.createAIInputFrame(user);
          }
        
        default:
          return this.createInitialFrame();
      }
    } catch (error) {
      console.error('Error handling frame action:', error);
      return this.createErrorFrame('An error occurred processing your request');
    }
  }

  private static createProviderSearchFrame(user: FarcasterUser | null): string {
    const metadata = this.generateFrameMetadata({
      title: 'Healthcare Providers',
      image: `${this.FRAME_BASE_URL}/api/frame/providers`,
      buttons: [
        { label: '🏥 All Providers', action: 'post' },
        { label: '🦷 Dental Care', action: 'post' },
        { label: '👶 Pediatrics', action: 'post' },
        { label: '🔙 Back', action: 'post' }
      ],
      postUrl: `${this.FRAME_BASE_URL}/api/frame/providers`
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>${metadata}</head>
        <body>
          <h1>Healthcare Providers</h1>
          <p>Find affordable healthcare providers in your area</p>
        </body>
      </html>
    `;
  }

  private static createAidProgramsFrame(user: FarcasterUser | null): string {
    const metadata = this.generateFrameMetadata({
      title: 'Aid Programs',
      image: `${this.FRAME_BASE_URL}/api/frame/aid`,
      buttons: [
        { label: '🍎 Food Assistance', action: 'post' },
        { label: '💡 Utility Help', action: 'post' },
        { label: '💊 Prescription Aid', action: 'post' },
        { label: '🔙 Back', action: 'post' }
      ],
      postUrl: `${this.FRAME_BASE_URL}/api/frame/aid`
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>${metadata}</head>
        <body>
          <h1>Aid Programs</h1>
          <p>Discover assistance programs you may qualify for</p>
        </body>
      </html>
    `;
  }

  private static createResourcesFrame(user: FarcasterUser | null): string {
    const metadata = this.generateFrameMetadata({
      title: 'Community Resources',
      image: `${this.FRAME_BASE_URL}/api/frame/resources`,
      buttons: [
        { label: '🏠 Food Banks', action: 'post' },
        { label: '🏠 Shelters', action: 'post' },
        { label: '👕 Clothing', action: 'post' },
        { label: '🔙 Back', action: 'post' }
      ],
      postUrl: `${this.FRAME_BASE_URL}/api/frame/resources`
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>${metadata}</head>
        <body>
          <h1>Community Resources</h1>
          <p>Find local community resources and support services</p>
        </body>
      </html>
    `;
  }

  private static createAIInputFrame(user: FarcasterUser | null): string {
    const metadata = this.generateFrameMetadata({
      title: 'Ask HealthNavi AI',
      image: `${this.FRAME_BASE_URL}/api/frame/ai-input`,
      buttons: [
        { label: '🤖 Ask Question', action: 'post' }
      ],
      inputText: 'Ask about healthcare, aid programs, or resources...',
      postUrl: `${this.FRAME_BASE_URL}/api/frame/ai-response`
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>${metadata}</head>
        <body>
          <h1>Ask HealthNavi AI</h1>
          <p>Type your question about healthcare, aid programs, or community resources</p>
        </body>
      </html>
    `;
  }

  private static async createAIResponseFrame(query: string, user: FarcasterUser | null): Promise<string> {
    // This would integrate with the AI service
    const response = `I can help you with: "${query}". Visit HealthNavi for detailed assistance!`;
    
    const metadata = this.generateFrameMetadata({
      title: 'HealthNavi AI Response',
      image: `${this.FRAME_BASE_URL}/api/frame/ai-response?q=${encodeURIComponent(query)}`,
      buttons: [
        { label: '🔍 More Details', action: 'link', target: `${this.FRAME_BASE_URL}?q=${encodeURIComponent(query)}` },
        { label: '❓ Ask Another', action: 'post' },
        { label: '🔙 Back', action: 'post' }
      ],
      postUrl: `${this.FRAME_BASE_URL}/api/frame/action`
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>${metadata}</head>
        <body>
          <h1>AI Response</h1>
          <p>${response}</p>
        </body>
      </html>
    `;
  }

  private static createErrorFrame(message: string): string {
    const metadata = this.generateFrameMetadata({
      title: 'Error - HealthNavi',
      image: `${this.FRAME_BASE_URL}/api/frame/error`,
      buttons: [
        { label: '🔄 Try Again', action: 'post' }
      ],
      postUrl: `${this.FRAME_BASE_URL}/api/frame/action`
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>${metadata}</head>
        <body>
          <h1>Error</h1>
          <p>${message}</p>
        </body>
      </html>
    `;
  }
}
