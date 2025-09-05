import React from 'react';
import { HealthcareProvider } from '../types';
import { MapPin, Phone, Globe, Check } from 'lucide-react';

interface ProviderCardProps {
  provider: HealthcareProvider;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-textPrimary">{provider.name}</h3>
        {provider.slidingScale && (
          <span className="bg-accent text-white text-xs px-2 py-1 rounded-full flex items-center">
            <Check className="w-3 h-3 mr-1" />
            Sliding Scale
          </span>
        )}
      </div>

      <div className="space-y-2 text-sm text-textSecondary">
        <div className="flex items-start space-x-2">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{provider.address}</span>
        </div>

        {provider.phone && (
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 flex-shrink-0" />
            <span>{provider.phone}</span>
          </div>
        )}

        {provider.website && (
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 flex-shrink-0" />
            <a href={provider.website} target="_blank" rel="noopener noreferrer" 
               className="text-primary hover:underline">
              Visit Website
            </a>
          </div>
        )}
      </div>

      <div className="mt-3">
        <p className="text-xs text-textSecondary mb-1">Specialties:</p>
        <div className="flex flex-wrap gap-1">
          {provider.specialties.map((specialty, index) => (
            <span key={index} className="bg-surface text-textPrimary text-xs px-2 py-1 rounded">
              {specialty}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3">
        <p className="text-xs text-textSecondary mb-1">Insurance Accepted:</p>
        <div className="flex flex-wrap gap-1">
          {provider.insuranceAccepted.map((insurance, index) => (
            <span key={index} className="bg-blue-50 text-primary text-xs px-2 py-1 rounded border border-blue-200">
              {insurance}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;