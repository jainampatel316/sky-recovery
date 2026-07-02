// Shared TypeScript types for the whole frontend

export interface Passenger {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  loyaltyStatus: 'MEMBER' | 'SILVER' | 'GOLD' | 'PLATINUM';
  bookings: Booking[];
}

export interface Flight {
  id: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  status: 'SCHEDULED' | 'DELAYED' | 'CANCELLED';
}

export interface Disruption {
  id: string;
  flightId: string;
  type: 'CANCELLED' | 'DELAYED';
  reason: string;
  delayMinutes?: number;
}

export interface Booking {
  id: string;
  pnr: string;
  passengerId: string;
  flightId: string;
  seatNumber?: string;
  class: 'ECONOMY' | 'BUSINESS' | 'FIRST';
  flight: Flight & { disruptions: Disruption[] };
}

export interface RecoveryRecommendation {
  id: string;
  recoveryRequestId: string;
  action: 'REBOOK' | 'REFUND' | 'WAIT' | 'ESCALATE';
  reason: string;
  confidenceScore: number;
  alternativeFlightId?: string;
  status: 'PROPOSED' | 'ACCEPTED' | 'REJECTED';
}

export interface Vouchers {
  meal: boolean;
  hotel: boolean;
  compensation: number;
}

export interface AnalysisResult {
  recoveryRequest: { id: string; bookingId: string; status: string };
  recommendation: RecoveryRecommendation;
  disruption: Disruption;
  alternatives: Flight[];
  vouchers: Vouchers;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  type: 'disruption' | 'recovery' | 'confirm' | 'info';
}
