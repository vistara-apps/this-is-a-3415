
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';
import FeatureCards from './components/FeatureCards';
import StatsCard from './components/StatsCard';

function App() {
  return (
    <div className="min-h-screen gradient-bg">
      <Header />
      
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              HealthNavi
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-2">
              Find Affordable Healthcare & Aid with AI Guidance
            </p>
            <p className="text-white/80 max-w-2xl mx-auto leading-relaxed">
              Get personalized help finding healthcare providers who accept Medicaid, 
              understanding your insurance, and accessing essential aid programs.
            </p>
          </div>

          {/* Stats */}
          <StatsCard />

          {/* Feature Cards */}
          <FeatureCards />

          {/* Main Chat Interface */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Start Your Healthcare Journey
            </h2>
            <ChatInterface />
          </div>

          {/* Quick Examples */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-white text-lg font-semibold mb-4">Try asking me:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-white/90 text-sm">"Find a pediatrician near me who accepts Medicaid"</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-white/90 text-sm">"What aid programs can help with prescription costs?"</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-white/90 text-sm">"Explain my insurance deductible"</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-white/90 text-sm">"Where can I find free food assistance?"</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/10 backdrop-blur-md border-t border-white/20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-white/80 text-sm">
              HealthNavi is here to help you navigate healthcare and assistance programs. 
              Always verify information with official sources before making decisions.
            </p>
            <p className="text-white/60 text-xs mt-2">
              © 2024 HealthNavi. Made with ❤️ to help those in need.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
