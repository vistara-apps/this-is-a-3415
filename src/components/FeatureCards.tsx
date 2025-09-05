import React from 'react';
import { Search, FileText, Gift, MapPin } from 'lucide-react';

const FeatureCards: React.FC = () => {
  const features = [
    {
      icon: Search,
      title: 'Provider Search',
      description: 'Find doctors, clinics, and hospitals that accept Medicaid or offer sliding scale fees',
      action: 'Find Providers'
    },
    {
      icon: FileText,
      title: 'Insurance Helper',
      description: 'Understand your insurance coverage, deductibles, and what services are covered',
      action: 'Explain My Plan'
    },
    {
      icon: Gift,
      title: 'Aid Programs',
      description: 'Discover government and non-profit assistance programs you may qualify for',
      action: 'Find Programs'
    },
    {
      icon: MapPin,
      title: 'Community Resources',
      description: 'Locate free clinics, food banks, and other essential community services nearby',
      action: 'Find Resources'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {features.map((feature, index) => (
        <div key={index} className="bg-white/10 backdrop-blur-md rounded-xl p-6 hover:bg-white/20 transition-all duration-300 border border-white/20">
          <div className="flex flex-col items-center text-center">
            <div className="bg-white/20 p-3 rounded-lg mb-4">
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
            <p className="text-white/80 text-sm mb-4 leading-relaxed">{feature.description}</p>
            <button className="text-white text-sm font-medium hover:text-white/80 transition-colors">
              {feature.action} →
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeatureCards;