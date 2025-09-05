// Location Service for geolocation and address handling
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  city: string;
  state: string;
  zipCode: string;
}

export class LocationService {
  private static readonly GEOCODING_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  /**
   * Get user's current location using browser geolocation API
   */
  static async getCurrentLocation(): Promise<Location | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn('Geolocation is not supported by this browser');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  /**
   * Geocode an address to get coordinates
   */
  static async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    try {
      if (!this.GEOCODING_API_KEY) {
        console.warn('Google Maps API key not configured');
        return null;
      }

      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${this.GEOCODING_API_KEY}`
      );

      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const location = result.geometry.location;
        
        // Extract address components
        const addressComponents = result.address_components;
        let city = '';
        let state = '';
        let zipCode = '';

        addressComponents.forEach((component: any) => {
          if (component.types.includes('locality')) {
            city = component.long_name;
          } else if (component.types.includes('administrative_area_level_1')) {
            state = component.short_name;
          } else if (component.types.includes('postal_code')) {
            zipCode = component.long_name;
          }
        });

        return {
          latitude: location.lat,
          longitude: location.lng,
          formattedAddress: result.formatted_address,
          city,
          state,
          zipCode
        };
      }

      return null;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  }

  /**
   * Reverse geocode coordinates to get address
   */
  static async reverseGeocode(latitude: number, longitude: number): Promise<GeocodeResult | null> {
    try {
      if (!this.GEOCODING_API_KEY) {
        console.warn('Google Maps API key not configured');
        return null;
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.GEOCODING_API_KEY}`
      );

      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        
        // Extract address components
        const addressComponents = result.address_components;
        let city = '';
        let state = '';
        let zipCode = '';

        addressComponents.forEach((component: any) => {
          if (component.types.includes('locality')) {
            city = component.long_name;
          } else if (component.types.includes('administrative_area_level_1')) {
            state = component.short_name;
          } else if (component.types.includes('postal_code')) {
            zipCode = component.long_name;
          }
        });

        return {
          latitude,
          longitude,
          formattedAddress: result.formatted_address,
          city,
          state,
          zipCode
        };
      }

      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }

  /**
   * Calculate distance between two points in miles
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Find nearby items based on location
   */
  static findNearbyItems<T extends { latitude?: number; longitude?: number }>(
    items: T[],
    userLocation: Location,
    maxDistance: number = 25 // miles
  ): Array<T & { distance: number }> {
    return items
      .filter(item => item.latitude && item.longitude)
      .map(item => ({
        ...item,
        distance: this.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          item.latitude!,
          item.longitude!
        )
      }))
      .filter(item => item.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);
  }

  /**
   * Extract location from query text
   */
  static extractLocationFromQuery(query: string): string | null {
    const lowerQuery = query.toLowerCase();
    
    // Common location patterns
    const locationPatterns = [
      /near me/i,
      /in ([a-zA-Z\s]+)/i,
      /at ([a-zA-Z\s]+)/i,
      /around ([a-zA-Z\s]+)/i,
      /([a-zA-Z\s]+), ([A-Z]{2})/i, // City, State
      /(\d{5})/i // ZIP code
    ];

    for (const pattern of locationPatterns) {
      const match = query.match(pattern);
      if (match) {
        if (pattern.source.includes('near me')) {
          return 'current_location';
        }
        return match[1] || match[0];
      }
    }

    return null;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Format distance for display
   */
  static formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 10) / 10} mi`;
    }
    return `${Math.round(distance)} mi`;
  }

  /**
   * Get state abbreviation from full name
   */
  static getStateAbbreviation(stateName: string): string {
    const states: Record<string, string> = {
      'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
      'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
      'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
      'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
      'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
      'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
      'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
      'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
      'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
      'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
      'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
      'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV',
      'wisconsin': 'WI', 'wyoming': 'WY'
    };

    return states[stateName.toLowerCase()] || stateName.toUpperCase();
  }
}
