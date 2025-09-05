import React from 'react';
import { CommunityResource } from '../types';
import { MapPin, Phone, List } from 'lucide-react';

interface ResourceCardProps {
  resource: CommunityResource;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-textPrimary">{resource.name}</h3>
        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
          {resource.type}
        </span>
      </div>

      <div className="space-y-2 text-sm text-textSecondary mb-3">
        <div className="flex items-start space-x-2">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{resource.address}</span>
        </div>

        <div className="flex items-center space-x-2">
          <Phone className="w-4 h-4 flex-shrink-0" />
          <span>{resource.contactInfo}</span>
        </div>
      </div>

      <div>
        <div className="flex items-center space-x-2 mb-2">
          <List className="w-4 h-4 text-textSecondary" />
          <span className="text-xs font-medium text-textSecondary">Services Offered:</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {resource.services.map((service, index) => (
            <span key={index} className="bg-surface text-textPrimary text-xs px-2 py-1 rounded">
              {service}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;