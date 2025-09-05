import React from 'react';
import { Heart, Menu } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="w-full bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white text-xl font-bold">HealthNavi</h1>
              <p className="text-white/80 text-sm">Find Affordable Healthcare & Aid</p>
            </div>
          </div>
          
          <button className="p-2 text-white/80 hover:text-white transition-colors lg:hidden">
            <Menu className="w-6 h-6" />
          </button>
          
          <nav className="hidden lg:flex space-x-6">
            <a href="#" className="text-white/80 hover:text-white transition-colors">Providers</a>
            <a href="#" className="text-white/80 hover:text-white transition-colors">Aid Programs</a>
            <a href="#" className="text-white/80 hover:text-white transition-colors">Resources</a>
            <a href="#" className="text-white/80 hover:text-white transition-colors">About</a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;