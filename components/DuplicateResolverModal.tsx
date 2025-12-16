import React, { useState, useMemo } from 'react';
import { X, Users, Merge, Check, AlertCircle, ArrowRight } from 'lucide-react';
import { Attendee } from '../types';

interface DuplicateResolverModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendees: Attendee[];
  onResolve: (survivor: Attendee, victimIds: string[]) => void;
}

const DuplicateResolverModal: React.FC<DuplicateResolverModalProps> = ({
  isOpen,
  onClose,
  attendees,
  onResolve,
}) => {
  const [mergeSessions, setMergeSessions] = useState<Record<string, boolean>>({});
  const [selectedPrimary, setSelectedPrimary] = useState<Record<string, string>>({});

  // Group attendees by normalized name
  const duplicateGroups = useMemo(() => {
    const groups: Record<string, Attendee[]> = {};
    attendees.forEach(a => {
      const key = a.name.trim().toLowerCase();
      if (!groups[key]) groups[key] = [];
      groups[key].push(a);
    });
    
    // Filter only those with more than 1 entry
    return Object.entries(groups)
      .filter(([_, group]) => group.length > 1)
      .map(([name, group]) => ({
        name: group[0].name, // Use original casing of first item
        items: group
      }));
  }, [attendees]);

  if (!isOpen) return null;

  const handleResolveGroup = (groupName: string, items: Attendee[]) => {
    const primaryId = selectedPrimary[groupName] || items[0].id;
    const shouldMerge = mergeSessions[groupName] || false;

    const survivor = items.find(i => i.id === primaryId)!;
    const victims = items.filter(i => i.id !== primaryId);
    
    const finalAttendee: Attendee = { ...survivor };

    if (shouldMerge) {
      // Sum up sessions
      const extraRemaining = victims.reduce((sum, v) => sum + v.sessionsRemaining, 0);
      const extraTotal = victims.reduce((sum, v) => sum + v.totalSessions, 0);
      
      finalAttendee.sessionsRemaining += extraRemaining;
      finalAttendee.totalSessions += extraTotal;
      
      // Append notes if they exist
      const otherNotes = victims
        .map(v => v.notes)
        .filter(Boolean)
        .join('; ');
        
      if (otherNotes) {
        finalAttendee.notes = finalAttendee.notes 
          ? `${finalAttendee.notes}; Merged: ${otherNotes}`
          : `Merged: ${otherNotes}`;
      }
    }

    onResolve(finalAttendee, victims.map(v => v.id));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
              <Merge size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Resolve Duplicates</h3>
              <p className="text-sm text-slate-500">
                {duplicateGroups.length > 0 
                  ? `Found ${duplicateGroups.length} sets of duplicate profiles.` 
                  : "No duplicates found."}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {duplicateGroups.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-green-500" size={32} />
              </div>
              <h4 className="text-lg font-medium text-slate-900">All Clear!</h4>
              <p className="text-slate-500 mt-2">No duplicate attendees were found in your list.</p>
              <button 
                onClick={onClose}
                className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {duplicateGroups.map((group, groupIdx) => {
                const primaryId = selectedPrimary[group.name] || group.items[0].id;
                const isMerging = mergeSessions[group.name] || false;
                
                return (
                  <div key={groupIdx} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                    <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users size={18} className="text-indigo-600" />
                        <span className="font-bold text-slate-800">{group.name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs font-medium text-slate-600 border border-slate-200">
                          {group.items.length} records
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Select Primary Account to Keep:</p>
                      
                      {group.items.map((item) => (
                        <label 
                          key={item.id} 
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                            primaryId === item.id 
                              ? 'bg-indigo-50 border-indigo-200 shadow-sm ring-1 ring-indigo-200' 
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <input 
                              type="radio" 
                              name={`group-${groupIdx}`}
                              checked={primaryId === item.id}
                              onChange={() => setSelectedPrimary(prev => ({ ...prev, [group.name]: item.id }))}
                              className="text-indigo-600 focus:ring-indigo-500"
                            />
                            <div>
                              <div className="text-sm font-medium text-slate-900 flex items-center gap-2">
                                <span>{item.classType}</span>
                                {item.paymentStatus === 'Paid' && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 rounded-full">Paid</span>}
                              </div>
                              <div className="text-xs text-slate-400">ID: ...{item.id.slice(-6)}</div>
                            </div>
                          </div>
                          <div className="text-right">
                             <div className="text-sm font-bold text-slate-700">{item.sessionsRemaining} / {item.totalSessions}</div>
                             <div className="text-xs text-slate-500">Sessions</div>
                          </div>
                        </label>
                      ))}

                      <div className="mt-4 pt-4 border-t border-slate-200/50">
                        <label className="flex items-center space-x-2 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={isMerging}
                            onChange={(e) => setMergeSessions(prev => ({ ...prev, [group.name]: e.target.checked }))}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm text-slate-700 font-medium">Sum sessions from all duplicates?</span>
                        </label>
                        <p className="text-xs text-slate-500 mt-1 ml-6">
                          If checked, the primary account will have <strong className="text-indigo-600">
                            {isMerging 
                              ? group.items.reduce((acc, i) => acc + i.sessionsRemaining, 0)
                              : group.items.find(i => i.id === primaryId)?.sessionsRemaining
                            }
                          </strong> sessions remaining.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
                      <button 
                        onClick={() => handleResolveGroup(group.name, group.items)}
                        className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition-colors"
                      >
                        <Merge size={16} />
                        <span>Merge & Resolve</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DuplicateResolverModal;