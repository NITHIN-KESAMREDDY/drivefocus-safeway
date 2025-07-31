export interface Distraction {
  id: string;
  timestamp: Date;
  duration: number; // in seconds
  type: 'phone_unlock' | 'app_usage' | 'notification';
}

export interface Trip {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  distractions: Distraction[];
  riskScore: number; // 0-100
  isActive: boolean;
}

export interface TripStats {
  totalTrips: number;
  totalDistractionTime: number; // in minutes
  averageRiskScore: number;
  weeklyAverage: number;
  improvement: number; // percentage change
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}