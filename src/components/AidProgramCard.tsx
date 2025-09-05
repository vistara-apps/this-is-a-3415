import React from 'react';
import { AidProgram } from '../types';
import { ExternalLink, Users, Tag } from 'lucide-react';

interface AidProgramCardProps {
  program: AidProgram;
}

const AidProgramCard: React.FC<AidProgramCardProps> = ({ program }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-textPrimary">{program.name}</h3>
        <span className="bg-accent text-white text-xs px-2 py-1 rounded-full flex items-center">
          <Tag className="w-3 h-3 mr-1" />
          {program.category}
        </span>
      </div>

      <p className="text-sm text-textSecondary mb-3 leading-relaxed">
        {program.description}
      </p>

      <div className="mb-3">
        <div className="flex items-center space-x-2 mb-2">
          <Users className="w-4 h-4 text-textSecondary" />
          <span className="text-xs font-medium text-textSecondary">Eligibility Requirements:</span>
        </div>
        <ul className="text-xs text-textSecondary space-y-1 ml-6">
          {program.eligibility.map((req, index) => (
            <li key={index} className="flex items-start">
              <span className="w-1 h-1 bg-textSecondary rounded-full mt-2 mr-2 flex-shrink-0"></span>
              {req}
            </li>
          ))}
        </ul>
      </div>

      <a
        href={program.applicationLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center space-x-2 text-primary hover:text-blue-600 text-sm font-medium transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
        <span>Apply Now</span>
      </a>
    </div>
  );
};

export default AidProgramCard;