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
  safeDrivingStreak: number; // consecutive trips with low risk
  mostDistractiveDayOfWeek: string;
  averageTripDuration: number; // in minutes
  totalDrivingTime: number; // in hours
  riskTrend: 'improving' | 'stable' | 'worsening';
  monthlyStats: {
    month: string;
    averageRisk: number;
    totalTrips: number;
    totalDistractions: number;
  }[];
  timePatterns: {
    hourOfDay: number;
    averageRisk: number;
    tripCount: number;
  }[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  avatar?: string;
  phone?: string;
  location?: string;
  emergencyContact?: {
    name: string;
    phone: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
    soundAlerts: boolean;
    riskThreshold: number; // 0-100
  };
  drivingProfile: {
    experienceLevel: 'beginner' | 'intermediate' | 'experienced';
    vehicleType: string;
    primaryRoutes: string[];
  };
}