import React, { useState } from 'react';
import { Search, Plus, MoreHorizontal, CheckCircle, AlertCircle, User, ArrowUpDown, Merge } from 'lucide-react';
import { Attendee, PaymentStatus } from '../types';
import DuplicateResolverModal from './DuplicateResolverModal';

interface AttendeeListProps {
  attendees: Attendee[];
  onAddClick: () => void;
  onCheckIn: (id: string) => void;
  onDelete: (id: string) => void;
  onResolveDuplicates: (survivor: Attendee, victimIds: string[]) => void;
}

const AttendeeList: React.FC<AttendeeListProps> = ({ attendees, onAddClick, onCheckIn, onDelete, onResolveDuplicates }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);

  const filteredAttendees = attendees.filter(attendee => {
    const matchesSearch = attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          attendee.classType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || attendee.paymentStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: PaymentStatus) => {
    switch(status) {
      case PaymentStatus.PAID: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case PaymentStatus.PENDING: return 'bg-amber-100 text-amber-700 border-amber-200';
      case PaymentStatus.OVERDUE: return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendees</h1>
          <p className="text-slate-500">Manage your students and track their sessions.</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setIsDuplicateModalOpen(true)}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors shadow-sm"
          >
            <Merge size={18} />
            <span className="hidden sm:inline">Check Duplicates</span>
          </button>
          <button 
            onClick={onAddClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Attendee</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search attendees..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-sm text-slate-500">Status:</span>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="all">All</option>
              <option value={PaymentStatus.PAID}>Paid</option>
              <option value={PaymentStatus.PENDING}>Pending</option>
              <option value={PaymentStatus.OVERDUE}>Overdue</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-semibold text-slate-500 tracking-wider">
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Class Type</th>
                <th className="px-6 py-4">Progress</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAttendees.length > 0 ? (
                filteredAttendees.map((attendee) => (
                  <tr key={attendee.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                          {attendee.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{attendee.name}</div>
                          <div className="text-xs text-slate-500">ID: #{attendee.id.slice(0,6)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-700">{attendee.classType}</span>
                    </td>
                    <td className="px-6 py-4 w-48">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium text-slate-700">{attendee.sessionsRemaining} left</span>
                        <span className="text-slate-400">of {attendee.totalSessions}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${attendee.sessionsRemaining < 3 ? 'bg-red-500' : 'bg-indigo-500'}`}
                          style={{ width: `${(attendee.sessionsRemaining / attendee.totalSessions) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(attendee.paymentStatus)}`}>
                        {attendee.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         {attendee.sessionsRemaining > 0 ? (
                            <button 
                              onClick={() => onCheckIn(attendee.id)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg tooltip"
                              title="Check In"
                            >
                              <CheckCircle size={18} />
                            </button>
                         ) : (
                           <span className="text-xs text-red-400 font-medium px-2">Empty</span>
                         )}
                        <button 
                          onClick={() => onDelete(attendee.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <User size={48} className="text-slate-200 mb-4" />
                      <p>No attendees found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DuplicateResolverModal 
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        attendees={attendees}
        onResolve={onResolveDuplicates}
      />
    </div>
  );
};

export default AttendeeList;