import React from 'react';

const StatsCard: React.FC = () => {
  const stats = [
    { value: '500+', label: 'Healthcare Providers' },
    { value: '50+', label: 'Aid Programs' },
    { value: '100+', label: 'Community Resources' },
    { value: '24/7', label: 'AI Support' }
  ];

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8">
      <h3 className="text-white text-lg font-semibold mb-4 text-center">
        Helping You Access Affordable Care
      </h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-white text-2xl font-bold">{stat.value}</div>
            <div className="text-white/80 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsCard;