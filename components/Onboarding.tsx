import React, { useState } from 'react';
import { ChevronRight, Sparkles, Zap, TrendingUp, Check } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    id: 1,
    title: "AI-Powered Import",
    description: "Stop manual data entry. Paste messy class lists or upload CSVs, and let our Gemini AI organize your roster instantly.",
    icon: Sparkles,
    color: "bg-indigo-100 text-indigo-600"
  },
  {
    id: 2,
    title: "Track & Manage",
    description: "Effortlessly check students in and track session balances. Visual progress bars help you spot who needs to renew.",
    icon: Zap,
    color: "bg-amber-100 text-amber-600"
  },
  {
    id: 3,
    title: "Business Insights",
    description: "Get actionable advice generated from your data. Understand retention, revenue potential, and class popularity.",
    icon: TrendingUp,
    color: "bg-emerald-100 text-emerald-600"
  }
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const Icon = slides[currentSlide].icon;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-[500px] animate-in zoom-in-95 duration-300">
        
        {/* Header / Skip */}
        <div className="p-6 flex justify-end">
          <button 
            onClick={onComplete}
            className="text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors"
          >
            Skip
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 px-8 flex flex-col items-center justify-center text-center">
          <div key={currentSlide} className="animate-in fade-in slide-in-from-right-8 duration-300 flex flex-col items-center">
            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-8 ${slides[currentSlide].color} shadow-lg rotate-3 transition-colors duration-500`}>
              <Icon size={40} />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              {slides[currentSlide].title}
            </h2>
            
            <p className="text-slate-500 text-lg leading-relaxed mb-8">
              {slides[currentSlide].description}
            </p>
          </div>
        </div>

        {/* Footer / Controls */}
        <div className="p-8 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            {/* Dots */}
            <div className="flex space-x-2">
              {slides.map((_, idx) => (
                <div 
                  key={idx}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    idx === currentSlide ? 'bg-indigo-600 w-6' : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>

            {/* Next Button */}
            <button 
              onClick={handleNext}
              className="flex items-center space-x-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              <span>{currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}</span>
              {currentSlide === slides.length - 1 ? (
                <Check size={18} />
              ) : (
                <ChevronRight size={18} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;