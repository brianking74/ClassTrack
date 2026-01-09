import React, { useState, useMemo } from 'react';
import { X, Users, Merge, Check, Trash2, Wand2 } from 'lucide-react';
import { Attendee } from '../types';

interface DuplicateResolverModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendees: Attendee[];
  onResolve: (survivor: Attendee, victimIds: string[]) => void;
}

// Levenshtein distance for fuzzy matching
const getLevenshteinDistance = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= b.length; i++) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const indicator = b[i - 1] === a[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + indicator
      );
    }
  }
  return matrix[b.length][a.length];
};

const DuplicateResolverModal: React.FC<DuplicateResolverModalProps> = ({
  isOpen,
  onClose,
  attendees,
  onResolve,
}) => {
  const [mergeSessions, setMergeSessions] = useState<Record<string, boolean>>({});
  const [selectedPrimary, setSelectedPrimary] = useState<Record<string, string>>({});
  const [ignoredIds, setIgnoredIds] = useState<Set<string>>(new Set());

  // Group attendees by normalized name or similarity
  const duplicateGroups = useMemo(() => {
    const groups: Attendee[][] = [];
    const visited = new Set<string>();

    // Sort by name length desc to prioritize longer names as "anchors"
    const sortedAttendees = [...attendees].sort((a, b) => b.name.length - a.name.length);

    sortedAttendees.forEach((attendee) => {
      if (visited.has(attendee.id)) return;

      const group = [attendee];
      visited.add(attendee.id);

      const name1 = attendee.name.trim().toLowerCase();

      // Find matches for this attendee
      sortedAttendees.forEach((candidate) => {
        if (visited.has(candidate.id)) return;

        const name2 = candidate.name.trim().toLowerCase();
        
        let isMatch = false;

        // 1. Exact Match
        if (name1 === name2) {
          isMatch = true;
        } 
        // 2. Fuzzy Match (Levenshtein)
        else if (name1.length > 3 && name2.length > 3) {
           const dist = getLevenshteinDistance(name1, name2);
           // Allow 1 typo for short names, 2 for longer names
           const threshold = name1.length > 6 ? 2 : 1;
           if (dist <= threshold) {
             isMatch = true;
           }
        }

        if (isMatch) {
          group.push(candidate);
          visited.add(candidate.id);
        }
      });

      if (group.length > 1) {
        groups.push(group);
      }
    });
    
    return groups.map((group, idx) => ({
      id: `group-${idx}`,
      name: group[0].name, 
      items: group
    }));
  }, [attendees]);

  // Filter out ignored IDs and groups that became too small
  const activeGroups = duplicateGroups
    .map(g => ({
      ...g,
      items: g.items.filter(item => !ignoredIds.has(item.id))
    }))
    .filter(g => g.items.length > 1);

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
      
      // Append notes
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
    
    // Clear selections for this group
    const newPrimary = { ...selectedPrimary };
    delete newPrimary[groupName];
    setSelectedPrimary(newPrimary);
  };

  const handleIgnore = (id: string) => {
    setIgnoredIds(prev => new Set(prev).add(id));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
              <Wand2 size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Resolve Duplicates</h3>
              <p className="text-sm text-slate-500">
                {activeGroups.length > 0 
                  ? `Found ${activeGroups.length} potential duplicate sets.` 
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
          {activeGroups.length === 0 ? (
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
              {activeGroups.map((group) => {
                const primaryId = selectedPrimary[group.id] || group.items[0].id;
                const isMerging = mergeSessions[group.id] || false;
                const isFuzzy = !group.items.every(i => i.name.toLowerCase() === group.items[0].name.toLowerCase());
                
                return (
                  <div key={group.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                    <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Users size={18} className="text-indigo-600" />
                        <span className="font-bold text-slate-800">{group.name}</span>
                        {isFuzzy && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium border border-amber-200">
                            Similar Names
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs font-medium text-slate-600 border border-slate-200">
                          {group.items.length} records
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Select Primary Account to Keep:</p>
                      
                      {group.items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-2">
                          <label 
                            className={`flex-1 flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                              primaryId === item.id 
                                ? 'bg-indigo-50 border-indigo-200 shadow-sm ring-1 ring-indigo-200' 
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <input 
                                type="radio" 
                                name={group.id}
                                checked={primaryId === item.id}
                                onChange={() => setSelectedPrimary(prev => ({ ...prev, [group.id]: item.id }))}
                                className="text-indigo-600 focus:ring-indigo-500"
                              />
                              <div>
                                <div className="text-sm font-medium text-slate-900 flex items-center gap-2">
                                  <span>{item.name}</span>
                                  {item.paymentStatus === 'Paid' && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 rounded-full">Paid</span>}
                                </div>
                                <div className="text-xs text-slate-500 flex gap-2">
                                   <span>{item.classType}</span>
                                   <span className="text-slate-300">|</span>
                                   <span>ID: ...{item.id.slice(-4)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                               <div className="text-sm font-bold text-slate-700">{item.sessionsRemaining} / {item.totalSessions}</div>
                               <div className="text-xs text-slate-500">Sessions</div>
                            </div>
                          </label>
                          <button 
                            onClick={() => handleIgnore(item.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Not a duplicate? Remove from group"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}

                      <div className="mt-4 pt-4 border-t border-slate-200/50">
                        <label className="flex items-center space-x-2 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={isMerging}
                            onChange={(e) => setMergeSessions(prev => ({ ...prev, [group.id]: e.target.checked }))}
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
                        onClick={() => handleResolveGroup(group.id, group.items)}
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