import { useState, useEffect, useCallback } from 'react';
import { Trip, Distraction, TripStats } from '@/types/trip';

export const useTrip = () => {
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [stats, setStats] = useState<TripStats>({
    totalTrips: 0,
    totalDistractionTime: 0,
    averageRiskScore: 0,
    weeklyAverage: 0,
    improvement: 0,
    safeDrivingStreak: 0,
    mostDistractiveDayOfWeek: 'Monday',
    averageTripDuration: 0,
    totalDrivingTime: 0,
    riskTrend: 'stable',
    monthlyStats: [],
    timePatterns: []
  });

  // Load trips from localStorage on mount
  useEffect(() => {
    const savedTrips = localStorage.getItem('drivefocus-trips');
    if (savedTrips) {
      const parsedTrips = JSON.parse(savedTrips).map((trip: any) => ({
        ...trip,
        startTime: new Date(trip.startTime),
        endTime: trip.endTime ? new Date(trip.endTime) : undefined,
        distractions: trip.distractions.map((d: any) => ({
          ...d,
          timestamp: new Date(d.timestamp)
        }))
      }));
      setTrips(parsedTrips);
    }
  }, []);

  // Calculate comprehensive stats whenever trips change
  useEffect(() => {
    const completedTrips = trips.filter(trip => !trip.isActive);
    const totalTrips = completedTrips.length;
    
    if (totalTrips === 0) {
      return;
    }

    // Basic stats
    const totalDistractionTime = completedTrips.reduce((acc, trip) => {
      return acc + trip.distractions.reduce((distTime, dist) => distTime + dist.duration, 0);
    }, 0) / 60; // Convert to minutes

    const averageRiskScore = completedTrips.reduce((acc, trip) => acc + trip.riskScore, 0) / totalTrips;
    
    const totalDrivingTime = completedTrips.reduce((acc, trip) => acc + trip.duration, 0) / 3600; // Convert to hours
    const averageTripDuration = completedTrips.reduce((acc, trip) => acc + trip.duration, 0) / totalTrips / 60; // Convert to minutes

    // Weekly calculations
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const weeklyTrips = completedTrips.filter(trip => trip.startTime >= lastWeek);
    const weeklyAverage = weeklyTrips.length > 0 ?
      weeklyTrips.reduce((acc, trip) => acc + trip.riskScore, 0) / weeklyTrips.length : 0;

    // Calculate improvement (compare to previous week)
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const prevWeekTrips = completedTrips.filter(trip => 
      trip.startTime >= twoWeeksAgo && trip.startTime < lastWeek
    );
    const prevWeekAverage = prevWeekTrips.length > 0 ?
      prevWeekTrips.reduce((acc, trip) => acc + trip.riskScore, 0) / prevWeekTrips.length : 0;
    
    const improvement = prevWeekAverage > 0 ? 
      ((prevWeekAverage - weeklyAverage) / prevWeekAverage) * 100 : 0;

    // Safe driving streak (consecutive trips with risk score < 30)
    let safeDrivingStreak = 0;
    for (let i = completedTrips.length - 1; i >= 0; i--) {
      if (completedTrips[i].riskScore < 30) {
        safeDrivingStreak++;
      } else {
        break;
      }
    }

    // Most distractive day of week
    const dayStats = Array.from({ length: 7 }, (_, i) => ({
      day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i],
      totalRisk: 0,
      count: 0
    }));
    
    completedTrips.forEach(trip => {
      const dayIndex = trip.startTime.getDay();
      dayStats[dayIndex].totalRisk += trip.riskScore;
      dayStats[dayIndex].count++;
    });

    const mostDistractiveDayOfWeek = dayStats
      .filter(day => day.count > 0)
      .reduce((prev, current) => 
        (current.totalRisk / current.count) > (prev.totalRisk / prev.count) ? current : prev
      ).day;

    // Risk trend analysis (last 3 weeks)
    const threeWeeksAgo = new Date();
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
    const recentTrips = completedTrips.filter(trip => trip.startTime >= threeWeeksAgo);
    
    let riskTrend: 'improving' | 'stable' | 'worsening' = 'stable';
    if (recentTrips.length >= 6) {
      const firstHalf = recentTrips.slice(0, Math.floor(recentTrips.length / 2));
      const secondHalf = recentTrips.slice(Math.floor(recentTrips.length / 2));
      
      const firstHalfAvg = firstHalf.reduce((acc, trip) => acc + trip.riskScore, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((acc, trip) => acc + trip.riskScore, 0) / secondHalf.length;
      
      const changePercent = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
      
      if (changePercent < -10) riskTrend = 'improving';
      else if (changePercent > 10) riskTrend = 'worsening';
    }

    // Monthly stats (last 6 months)
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i, 1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      const monthTrips = completedTrips.filter(trip => 
        trip.startTime >= monthStart && trip.startTime < monthEnd
      );
      
      if (monthTrips.length > 0) {
        monthlyStats.push({
          month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          averageRisk: monthTrips.reduce((acc, trip) => acc + trip.riskScore, 0) / monthTrips.length,
          totalTrips: monthTrips.length,
          totalDistractions: monthTrips.reduce((acc, trip) => acc + trip.distractions.length, 0)
        });
      }
    }

    // Time pattern analysis (by hour of day)
    const timePatterns = Array.from({ length: 24 }, (_, hour) => ({
      hourOfDay: hour,
      averageRisk: 0,
      tripCount: 0
    }));

    completedTrips.forEach(trip => {
      const hour = trip.startTime.getHours();
      timePatterns[hour].tripCount++;
      timePatterns[hour].averageRisk = 
        (timePatterns[hour].averageRisk * (timePatterns[hour].tripCount - 1) + trip.riskScore) / timePatterns[hour].tripCount;
    });

    setStats({
      totalTrips,
      totalDistractionTime,
      averageRiskScore,
      weeklyAverage,
      improvement,
      safeDrivingStreak,
      mostDistractiveDayOfWeek,
      averageTripDuration,
      totalDrivingTime,
      riskTrend,
      monthlyStats,
      timePatterns: timePatterns.filter(pattern => pattern.tripCount > 0)
    });
  }, [trips]);

  const startTrip = useCallback(() => {
    const newTrip: Trip = {
      id: Date.now().toString(),
      startTime: new Date(),
      duration: 0,
      distractions: [],
      riskScore: 0,
      isActive: true
    };
    setCurrentTrip(newTrip);
  }, []);

  const endTrip = useCallback(() => {
    if (!currentTrip) return;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - currentTrip.startTime.getTime()) / 1000);
    const riskScore = calculateRiskScore(currentTrip.distractions, duration);

    const completedTrip: Trip = {
      ...currentTrip,
      endTime,
      duration,
      riskScore,
      isActive: false
    };

    const updatedTrips = [...trips, completedTrip];
    setTrips(updatedTrips);
    setCurrentTrip(null);

    // Save to localStorage
    localStorage.setItem('drivefocus-trips', JSON.stringify(updatedTrips));

    return completedTrip;
  }, [currentTrip, trips]);

  const addDistraction = useCallback((type: Distraction['type'] = 'phone_unlock') => {
    if (!currentTrip) return;

    const newDistraction: Distraction = {
      id: Date.now().toString(),
      timestamp: new Date(),
      duration: Math.floor(Math.random() * 30) + 5, // 5-35 seconds
      type
    };

    const updatedTrip = {
      ...currentTrip,
      distractions: [...currentTrip.distractions, newDistraction]
    };

    setCurrentTrip(updatedTrip);
  }, [currentTrip]);

  // Update current trip duration every second
  useEffect(() => {
    if (!currentTrip) return;

    const interval = setInterval(() => {
      const now = new Date();
      const duration = Math.floor((now.getTime() - currentTrip.startTime.getTime()) / 1000);
      setCurrentTrip(prev => prev ? { ...prev, duration } : null);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTrip]);

  return {
    currentTrip,
    trips,
    stats,
    startTrip,
    endTrip,
    addDistraction
  };
};

// Enhanced risk score calculation with multiple factors
const calculateRiskScore = (distractions: Distraction[], tripDuration: number): number => {
  if (tripDuration === 0) return 0;

  const totalDistractionTime = distractions.reduce((acc, d) => acc + d.duration, 0);
  const distractionRate = totalDistractionTime / tripDuration;
  const frequency = distractions.length / Math.max(tripDuration / 60, 1); // per minute
  
  // Different weights for different distraction types
  const typeWeights = {
    'phone_unlock': 1.0,
    'app_usage': 1.2,
    'notification': 0.8
  };
  
  const weightedDistractions = distractions.reduce((acc, d) => {
    return acc + (d.duration * typeWeights[d.type]);
  }, 0);
  
  const weightedRate = weightedDistractions / tripDuration;
  
  // Base score from distraction rate (0-60 points)
  const baseScore = Math.min(weightedRate * 120, 60);
  
  // Frequency penalty (0-25 points)
  const frequencyScore = Math.min(frequency * 15, 25);
  
  // Clustering penalty - consecutive distractions are worse (0-15 points)
  let clusteringScore = 0;
  for (let i = 1; i < distractions.length; i++) {
    const timeDiff = (distractions[i].timestamp.getTime() - distractions[i-1].timestamp.getTime()) / 1000;
    if (timeDiff < 120) { // Within 2 minutes
      clusteringScore += 3;
    }
  }
  clusteringScore = Math.min(clusteringScore, 15);
  
  // Total score
  const totalScore = baseScore + frequencyScore + clusteringScore;
  
  return Math.min(Math.round(totalScore), 100);
};