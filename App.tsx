import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AttendeeList from './components/AttendeeList';
import SmartImport from './components/SmartImport';
import LandingPage from './components/LandingPage';
import AddAttendeeModal from './components/AddAttendeeModal';
import ClassManager from './components/ClassManager'; // New Import
import { Attendee, PaymentStatus, ViewState, ClassDefinition } from './types';
import { generateInsights } from './services/geminiService';

// Initial Mock Data
const MOCK_ATTENDEES: Attendee[] = [
  { id: '1', name: 'Sarah Connor', classType: 'Pilates Advanced', totalSessions: 10, sessionsRemaining: 8, paymentStatus: PaymentStatus.PAID },
  { id: '2', name: 'John Wick', classType: 'Boxing', totalSessions: 20, sessionsRemaining: 2, paymentStatus: PaymentStatus.PAID },
  { id: '3', name: 'Elena Fisher', classType: 'Yoga', totalSessions: 5, sessionsRemaining: 5, paymentStatus: PaymentStatus.PENDING },
  { id: '4', name: 'Nathan Drake', classType: 'Climbing', totalSessions: 10, sessionsRemaining: 0, paymentStatus: PaymentStatus.OVERDUE },
];

const MOCK_CLASSES: ClassDefinition[] = [
  { id: '1', name: 'Pilates Advanced', description: 'High intensity pilates for experienced students' },
  { id: '2', name: 'Boxing', description: 'Technique and sparring' },
  { id: '3', name: 'Yoga', description: 'Vinyasa flow' },
  { id: '4', name: 'Climbing', description: 'Bouldering basics' },
];

const STORAGE_KEY = 'classtrack_attendees';
const CLASSES_STORAGE_KEY = 'classtrack_classes';

const App: React.FC = () => {
  // Start at 'landing' page by default
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  
  // Initialize Attendees
  const [attendees, setAttendees] = useState<Attendee[]>(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) return JSON.parse(savedData);
    } catch (error) {
      console.error('Failed to load data from storage:', error);
    }
    return MOCK_ATTENDEES;
  });

  // Initialize Classes
  const [classes, setClasses] = useState<ClassDefinition[]>(() => {
    try {
      const savedData = localStorage.getItem(CLASSES_STORAGE_KEY);
      if (savedData) return JSON.parse(savedData);
    } catch (error) {
      console.error('Failed to load classes from storage:', error);
    }
    return MOCK_CLASSES;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Persist data
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(attendees));
    } catch (error) { console.error('Failed to save data:', error); }
  }, [attendees]);

  useEffect(() => {
    try {
      localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(classes));
    } catch (error) { console.error('Failed to save classes:', error); }
  }, [classes]);

  // Attendee Handlers
  const handleAddAttendee = (newAttendee: Attendee) => {
    setAttendees(prev => [newAttendee, ...prev]);
    setAiInsights(null);
  };

  const handleCheckIn = (id: string) => {
    setAttendees(prev => prev.map(att => {
      if (att.id === id && att.sessionsRemaining > 0) {
        return {
          ...att,
          sessionsRemaining: att.sessionsRemaining - 1,
          lastCheckIn: new Date().toISOString()
        };
      }
      return att;
    }));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to remove this attendee?')) {
      setAttendees(prev => prev.filter(a => a.id !== id));
    }
  };

  // Resolve duplicate attendees by removing victims and updating survivor
  const handleResolveDuplicates = (survivor: Attendee, victimIds: string[]) => {
    setAttendees(prev => {
      // Remove both the victims and the original survivor entry (to replace it with the updated one)
      const allInvolvedIds = [...victimIds, survivor.id];
      const remaining = prev.filter(a => !allInvolvedIds.includes(a.id));
      return [survivor, ...remaining];
    });
    setAiInsights(null);
  };

  // Class Handlers
  const handleAddClass = (newClass: ClassDefinition) => {
    setClasses(prev => [...prev, newClass]);
  };

  const handleEditClass = (updatedClass: ClassDefinition) => {
    setClasses(prev => prev.map(c => c.id === updatedClass.id ? updatedClass : c));
  };

  const handleDeleteClass = (id: string) => {
    if (window.confirm('Are you sure you want to delete this class type?')) {
      setClasses(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleImportComplete = (newAttendees: Attendee[]) => {
    setAttendees(prev => [...newAttendees, ...prev]);
    setCurrentView('attendees');
  };

  const handleGenerateInsights = async () => {
    setAiInsights("Analyzing your data with Gemini...");
    const insights = await generateInsights(attendees);
    setAiInsights(insights);
  };

  // Logic to render full screen landing page
  if (currentView === 'landing') {
    return <LandingPage onEnter={() => setCurrentView('dashboard')} />;
  }

  // Render Main App Content
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard attendees={attendees} aiInsights={aiInsights} onGenerateInsights={handleGenerateInsights} />;
      case 'attendees':
        return <AttendeeList 
                  attendees={attendees} 
                  onAddClick={() => setIsModalOpen(true)} 
                  onCheckIn={handleCheckIn}
                  onDelete={handleDelete}
                  onResolveDuplicates={handleResolveDuplicates}
               />;
      case 'classes':
        return <ClassManager 
                  classes={classes}
                  onAdd={handleAddClass}
                  onEdit={handleEditClass}
                  onDelete={handleDeleteClass}
               />;
      case 'import':
        return <SmartImport onImportComplete={handleImportComplete} />;
      default:
        return <Dashboard attendees={attendees} aiInsights={aiInsights} onGenerateInsights={handleGenerateInsights} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 p-4 z-20 flex justify-between items-center">
         <div className="font-bold text-lg text-indigo-600">ClassTrack</div>
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
           Menu
         </button>
      </div>
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-30 flex flex-col p-8 space-y-6 md:hidden">
           <button onClick={() => setIsMobileMenuOpen(false)} className="self-end text-slate-500">Close</button>
           <button onClick={() => { setCurrentView('dashboard'); setIsMobileMenuOpen(false); }} className="text-xl font-bold">Dashboard</button>
           <button onClick={() => { setCurrentView('attendees'); setIsMobileMenuOpen(false); }} className="text-xl font-bold">Attendees</button>
           <button onClick={() => { setCurrentView('classes'); setIsMobileMenuOpen(false); }} className="text-xl font-bold">Classes</button>
           <button onClick={() => { setCurrentView('import'); setIsMobileMenuOpen(false); }} className="text-xl font-bold">Import</button>
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-4 md:p-8 mt-16 md:mt-0 relative">
        {renderContent()}
      </main>

      <AddAttendeeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddAttendee} 
      />
    </div>
  );
};

export default App;