import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Car, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Phone,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Trip, TripStats } from '@/types/trip';
import { formatDuration, formatTime } from '@/lib/formatters';

interface TripHistoryProps {
  trips: Trip[];
  stats: TripStats;
  onBack: () => void;
  onViewTrip: (trip: Trip) => void;
}

export const TripHistory = ({ trips, stats, onBack, onViewTrip }: TripHistoryProps) => {
  const [filter, setFilter] = useState<'all' | 'week' | 'month'>('all');

  const getFilteredTrips = () => {
    const now = new Date();
    const filteredTrips = trips.filter(trip => {
      if (filter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return trip.startTime >= weekAgo;
      } else if (filter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return trip.startTime >= monthAgo;
      }
      return true;
    });

    return filteredTrips.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  };

  const getRiskColor = (score: number) => {
    if (score <= 30) return 'text-accent';
    if (score <= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getRiskBadgeVariant = (score: number) => {
    if (score <= 30) return 'default';
    if (score <= 60) return 'secondary';
    return 'destructive';
  };

  // Calculate weekly trend
  const now = new Date();
  const thisWeek = trips.filter(trip => {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return trip.startTime >= weekAgo;
  });
  const lastWeek = trips.filter(trip => {
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return trip.startTime >= twoWeeksAgo && trip.startTime < weekAgo;
  });

  const thisWeekAvg = thisWeek.length > 0 ? thisWeek.reduce((acc, trip) => acc + trip.riskScore, 0) / thisWeek.length : 0;
  const lastWeekAvg = lastWeek.length > 0 ? lastWeek.reduce((acc, trip) => acc + trip.riskScore, 0) / lastWeek.length : 0;
  const weeklyTrend = lastWeekAvg > 0 ? ((lastWeekAvg - thisWeekAvg) / lastWeekAvg) * 100 : 0;

  const filteredTrips = getFilteredTrips();

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Trip History</h1>
          <p className="text-muted-foreground">Review your driving sessions</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        {['all', 'week', 'month'].map((filterOption) => (
          <Button
            key={filterOption}
            variant={filter === filterOption ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter(filterOption as typeof filter)}
          >
            {filterOption === 'all' ? 'All Time' : 
             filterOption === 'week' ? 'This Week' : 'This Month'}
          </Button>
        ))}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Trips</p>
                <p className="text-2xl font-bold">{stats.totalTrips}</p>
              </div>
              <Car className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Risk Score</p>
                <p className={`text-2xl font-bold ${getRiskColor(stats.averageRiskScore)}`}>
                  {Math.round(stats.averageRiskScore)}
                </p>
              </div>
              <Target className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Weekly Trend</p>
                <div className="flex items-center gap-2">
                  <p className={`text-2xl font-bold ${weeklyTrend > 0 ? 'text-accent' : weeklyTrend < 0 ? 'text-destructive' : 'text-foreground'}`}>
                    {Math.round(Math.abs(weeklyTrend))}%
                  </p>
                  {weeklyTrend > 0 ? (
                    <TrendingDown className="h-5 w-5 text-accent" />
                  ) : weeklyTrend < 0 ? (
                    <TrendingUp className="h-5 w-5 text-destructive" />
                  ) : null}
                </div>
              </div>
              <Calendar className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trip List */}
      <Card className="border-border/50 shadow-card">
        <CardHeader>
          <CardTitle>Your Trips</CardTitle>
          <CardDescription>
            {filteredTrips.length} trips • Click on a trip to view detailed analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTrips.length > 0 ? (
            <div className="space-y-3">
              {filteredTrips.map((trip) => {
                const totalDistractionTime = trip.distractions.reduce((acc, d) => acc + d.duration, 0);
                
                return (
                  <div
                    key={trip.id}
                    onClick={() => onViewTrip(trip)}
                    className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/30 cursor-pointer transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${
                        trip.riskScore <= 30 ? 'bg-accent/10' : 
                        trip.riskScore <= 60 ? 'bg-warning/10' : 'bg-destructive/10'
                      } group-hover:scale-110 transition-transform duration-300`}>
                        {trip.riskScore <= 30 ? 
                          <CheckCircle className="h-5 w-5 text-accent" /> :
                          <AlertTriangle className={`h-5 w-5 ${trip.riskScore <= 60 ? 'text-warning' : 'text-destructive'}`} />
                        }
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{formatTime(trip.startTime)}</p>
                          <Badge variant={getRiskBadgeVariant(trip.riskScore)} className="text-xs">
                            {trip.riskScore}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(trip.duration)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {trip.distractions.length} distractions
                          </div>
                          {totalDistractionTime > 0 && (
                            <div className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {Math.round(totalDistractionTime / 60)}m distracted
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getRiskColor(trip.riskScore)}`}>
                        {trip.riskScore}
                      </div>
                      <div className="w-20 mt-1">
                        <Progress value={trip.riskScore} className="h-1" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Car className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No trips found</h3>
              <p className="text-muted-foreground">
                {filter === 'all' 
                  ? 'Start your first trip to see data here!'
                  : `No trips in the selected ${filter} period.`
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};