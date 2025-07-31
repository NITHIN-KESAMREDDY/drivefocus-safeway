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
    improvement: 0
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

  // Calculate stats whenever trips change
  useEffect(() => {
    const totalTrips = trips.length;
    const totalDistractionTime = trips.reduce((acc, trip) => {
      return acc + trip.distractions.reduce((distTime, dist) => distTime + dist.duration, 0);
    }, 0) / 60; // Convert to minutes

    const averageRiskScore = totalTrips > 0 ? 
      trips.reduce((acc, trip) => acc + trip.riskScore, 0) / totalTrips : 0;

    // Calculate weekly average (last 7 days)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const weeklyTrips = trips.filter(trip => trip.startTime >= lastWeek);
    const weeklyAverage = weeklyTrips.length > 0 ?
      weeklyTrips.reduce((acc, trip) => acc + trip.riskScore, 0) / weeklyTrips.length : 0;

    // Calculate improvement (compare to previous week)
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const prevWeekTrips = trips.filter(trip => 
      trip.startTime >= twoWeeksAgo && trip.startTime < lastWeek
    );
    const prevWeekAverage = prevWeekTrips.length > 0 ?
      prevWeekTrips.reduce((acc, trip) => acc + trip.riskScore, 0) / prevWeekTrips.length : 0;
    
    const improvement = prevWeekAverage > 0 ? 
      ((prevWeekAverage - weeklyAverage) / prevWeekAverage) * 100 : 0;

    setStats({
      totalTrips,
      totalDistractionTime,
      averageRiskScore,
      weeklyAverage,
      improvement
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

// Calculate risk score based on distractions and trip duration
const calculateRiskScore = (distractions: Distraction[], tripDuration: number): number => {
  if (tripDuration === 0) return 0;

  const totalDistractionTime = distractions.reduce((acc, d) => acc + d.duration, 0);
  const distractionRate = totalDistractionTime / tripDuration;
  const frequency = distractions.length / (tripDuration / 60); // per minute

  // Risk score algorithm (0-100)
  const baseScore = Math.min(distractionRate * 100, 70);
  const frequencyBonus = Math.min(frequency * 10, 30);
  
  return Math.min(Math.round(baseScore + frequencyBonus), 100);
};