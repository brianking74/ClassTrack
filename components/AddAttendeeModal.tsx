import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Attendee, PaymentStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface AddAttendeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (attendee: Attendee) => void;
}

const AddAttendeeModal: React.FC<AddAttendeeModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [classType, setClassType] = useState('');
  const [totalSessions, setTotalSessions] = useState(10);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.PENDING);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAttendee: Attendee = {
      id: uuidv4(),
      name,
      classType,
      totalSessions: Number(totalSessions),
      sessionsRemaining: Number(totalSessions),
      paymentStatus,
    };
    onAdd(newAttendee);
    // Reset form
    setName('');
    setClassType('');
    setTotalSessions(10);
    setPaymentStatus(PaymentStatus.PENDING);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">New Registration</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="e.g. Alex Johnson"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Class Type</label>
            <input 
              type="text" 
              required
              value={classType}
              onChange={(e) => setClassType(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="e.g. HIIT Morning"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sessions Pkg</label>
              <input 
                type="number" 
                min="1"
                required
                value={totalSessions}
                onChange={(e) => setTotalSessions(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payment</label>
              <select 
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
              >
                <option value={PaymentStatus.PAID}>Paid</option>
                <option value={PaymentStatus.PENDING}>Pending</option>
                <option value={PaymentStatus.OVERDUE}>Overdue</option>
              </select>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm"
            >
              Register Attendee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAttendeeModal;
