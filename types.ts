export enum PaymentStatus {
  PAID = 'Paid',
  PENDING = 'Pending',
  OVERDUE = 'Overdue'
}

export interface Attendee {
  id: string;
  name: string;
  classType: string;
  totalSessions: number;
  sessionsRemaining: number;
  paymentStatus: PaymentStatus;
  notes?: string;
  lastCheckIn?: string; // ISO Date string
}

export interface ClassDefinition {
  id: string;
  name: string;
  description?: string;
}

export interface DashboardStats {
  totalAttendees: number;
  activeSessions: number;
  pendingPayments: number;
  lowBalance: number;
}

export type ViewState = 'landing' | 'onboarding' | 'dashboard' | 'attendees' | 'import' | 'classes';