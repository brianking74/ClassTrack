import React, { useState, useRef } from 'react';
import { FileText, ArrowRight, Loader2, Check, AlertTriangle, Upload } from 'lucide-react';
import { parseImportData } from '../services/geminiService';
import { Attendee } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface SmartImportProps {
  onImportComplete: (newAttendees: Attendee[]) => void;
}

const SmartImport: React.FC<SmartImportProps> = ({ onImportComplete }) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<Attendee[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setInputText(content);
        setError(null);
      }
    };
    reader.onerror = () => {
      setError("Failed to read file.");
    };
    reader.readAsText(file);
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const handleProcess = async () => {
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const parsed = await parseImportData(inputText);
      
      // Hydrate with IDs
      const completeAttendees: Attendee[] = parsed.map(p => ({
        id: uuidv4(),
        name: p.name || 'Unknown',
        classType: p.classType || 'General',
        totalSessions: p.totalSessions || 10,
        sessionsRemaining: p.sessionsRemaining !== undefined ? p.sessionsRemaining : 10,
        paymentStatus: p.paymentStatus || 'Pending' as any,
        notes: p.notes
      }));
      
      setPreviewData(completeAttendees);
    } catch (err) {
      setError("Failed to parse data. Please try again with a different format.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (previewData) {
      onImportComplete(previewData);
      // Reset form
      setPreviewData(null);
      setInputText('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
       <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Smart Import</h1>
        <p className="text-slate-500">Paste your messy spreadsheet data, email lists, or upload a CSV. Our AI will handle the rest.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Area */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-slate-700">Raw Data Input</label>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center space-x-1 px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
              >
                <Upload size={16} />
                <span>Upload CSV</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv,.txt,.md"
                onChange={handleFileChange}
              />
            </div>
            <textarea 
              className="w-full flex-1 min-h-[300px] p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm font-mono text-slate-600 bg-slate-50"
              placeholder={`Example:\n\nJohn Doe, Yoga Class, 10 sessions, Paid\nJane Smith - Pilates - 5/5 sessions left - Pending\nBob Wilson, Boxing, 12 pack (Paid)`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isProcessing}
            />
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-400">Powered by Gemini 2.5 Flash</span>
              <button 
                onClick={handleProcess}
                disabled={isProcessing || !inputText.trim()}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
                <span>{isProcessing ? 'Processing...' : 'Parse Data'}</span>
              </button>
            </div>
             {error && (
              <div className="mt-3 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center space-x-2">
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Preview Area */}
        <div className="space-y-4">
          <div className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col ${!previewData ? 'items-center justify-center text-center border-dashed' : ''}`}>
            
            {!previewData ? (
              <div className="text-slate-400 max-w-xs">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowRight className="text-slate-300" size={24} />
                </div>
                <p className="font-medium text-slate-600">No data to preview</p>
                <p className="text-sm mt-1">Process your text on the left to see the structured result here.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                   <h3 className="font-semibold text-slate-800">Preview ({previewData.length} items)</h3>
                   <button 
                    onClick={() => setPreviewData(null)}
                    className="text-xs text-slate-500 hover:text-slate-800 underline"
                   >
                    Clear
                   </button>
                </div>
                <div className="flex-1 overflow-y-auto max-h-[400px] pr-2 space-y-3 custom-scrollbar">
                  {previewData.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex flex-col gap-1">
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-900">{item.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${item.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {item.paymentStatus}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex justify-between">
                        <span>{item.classType}</span>
                        <span>{item.sessionsRemaining}/{item.totalSessions} sessions</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button 
                    onClick={handleConfirm}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors shadow-sm"
                  >
                    <Check size={20} />
                    <span>Import {previewData.length} Attendees</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartImport;