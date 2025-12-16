import React from 'react';
import { Activity, Zap, Users, Trophy, ChevronRight, BarChart3 } from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans overflow-x-hidden relative selection:bg-indigo-500 selection:text-white">
      
      {/* Hero Video Background */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          poster="https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=2629&auto=format&fit=crop"
          className="w-full h-full object-cover opacity-50"
        >
          {/* Kids playing soccer video source */}
          <source src="https://videos.pexels.com/video-files/4761426/4761426-uhd_2560_1440_25fps.mp4" type="video/mp4" />
        </video>
        
        {/* Gradient Overlay for Readability - Lightened significantly to show video */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/60 to-slate-900/20" />
      </div>

      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-3/4 h-screen bg-indigo-900/10 -skew-x-12 transform origin-top-right pointer-events-none z-0 mix-blend-overlay" />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none z-0" />
      <div className="absolute top-20 left-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none animate-pulse z-0" />

      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center transform -rotate-3 shadow-lg shadow-indigo-500/20">
            <Activity className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-2xl tracking-tight">ClassTrack</span>
        </div>
        <button 
          onClick={onEnter}
          className="hidden sm:block text-slate-300 hover:text-white font-medium transition-colors"
        >
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-10 pb-20 lg:pt-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-in slide-in-from-left duration-700 fade-in">
            <div className="inline-flex items-center space-x-2 bg-slate-800/50 rounded-full px-4 py-1.5 border border-slate-700/50 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">v2.0 Now Live</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black leading-tight tracking-tight">
              Train Hard. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                Track Easy.
              </span>
            </h1>
            
            <p className="text-xl text-slate-100 max-w-lg leading-relaxed drop-shadow-md">
              The elite attendance management system for modern coaches. Focus on your athletes, not your spreadsheets.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={onEnter}
                className="group relative px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_0_60px_-15px_rgba(79,70,229,0.6)] flex items-center justify-center space-x-3"
              >
                <span>Launch Dashboard</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold rounded-xl transition-all border border-slate-700 hover:border-slate-600 backdrop-blur-sm">
                View Demo
              </button>
            </div>
          </div>

          {/* Feature Grid / Graphic */}
          <div className="relative animate-in slide-in-from-right duration-1000 fade-in delay-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 mt-8">
                <FeatureCard 
                  icon={Zap} 
                  title="Smart Import" 
                  desc="Paste raw text, get structured data instantly."
                  color="text-amber-400"
                  delay="0"
                />
                <FeatureCard 
                  icon={Users} 
                  title="Roster Management" 
                  desc="Track sessions and payments in one view."
                  color="text-emerald-400"
                  delay="100"
                />
              </div>
              <div className="space-y-4">
                <FeatureCard 
                  icon={BarChart3} 
                  title="Performance Insights" 
                  desc="AI-driven analytics for your business."
                  color="text-blue-400"
                  delay="200"
                />
                <FeatureCard 
                  icon={Trophy} 
                  title="Elite Tracking" 
                  desc="Built for high-performance coaching."
                  color="text-purple-400"
                  delay="300"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Stats */}
      <footer className="border-t border-slate-800/50 bg-slate-900/50 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <Stat label="Active Coaches" value="2,500+" />
            <Stat label="Sessions Tracked" value="1.2M+" />
            <Stat label="Time Saved" value="15hrs/mo" />
            <Stat label="User Rating" value="4.9/5" />
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc, color, delay }: any) => (
  <div 
    className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/50 hover:bg-slate-800/80 hover:border-indigo-500/30 transition-all duration-300 group backdrop-blur-md shadow-lg"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={`w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${color}`}>
      <Icon size={24} />
    </div>
    <h3 className="font-bold text-lg mb-2 text-slate-100">{title}</h3>
    <p className="text-sm text-slate-300 leading-relaxed">{desc}</p>
  </div>
);

const Stat = ({ label, value }: any) => (
  <div>
    <div className="text-3xl font-black text-white mb-1 drop-shadow-sm">{value}</div>
    <div className="text-sm font-medium text-slate-400 uppercase tracking-wide">{label}</div>
  </div>
);

export default LandingPage;