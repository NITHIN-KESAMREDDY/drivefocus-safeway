import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Car, 
  Play, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Phone,
  Trophy,
  Target
} from 'lucide-react';
import { Trip, TripStats } from '@/types/trip';
import { formatDuration, formatTime } from '@/lib/formatters';

interface DashboardProps {
  stats: TripStats;
  currentTrip: Trip | null;
  recentTrips: Trip[];
  onStartTrip: () => void;
  onViewTrip: (trip: Trip) => void;
}

export const Dashboard = ({ stats, currentTrip, recentTrips, onStartTrip, onViewTrip }: DashboardProps) => {
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

  const currentRiskScore = currentTrip ? 
    Math.min(Math.round((currentTrip.distractions.length / Math.max(currentTrip.duration / 60, 1)) * 20), 100) : 0;

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            DriveFocus
          </h1>
          <p className="text-muted-foreground">Drive safely, stay focused</p>
        </div>
        <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-primary-glow/10 border border-primary/20">
          <Car className="h-6 w-6 text-primary" />
        </div>
      </div>

      {/* Active Trip Card */}
      {currentTrip ? (
        <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary-glow/5 shadow-glow animate-pulse-glow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                <CardTitle className="text-primary">Trip Active</CardTitle>
              </div>
              <Badge variant="outline" className="border-primary text-primary">
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {formatDuration(currentTrip.duration)}
                </div>
                <div className="text-sm text-muted-foreground">Duration</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getRiskColor(currentRiskScore)}`}>
                  {currentRiskScore}
                </div>
                <div className="text-sm text-muted-foreground">Risk Score</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Distraction Level</span>
                <span className={getRiskColor(currentRiskScore)}>
                  {currentRiskScore <= 30 ? 'Low' : currentRiskScore <= 60 ? 'Medium' : 'High'}
                </span>
              </div>
              <Progress value={currentRiskScore} className="h-2" />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{currentTrip.distractions.length} distractions detected</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/50 shadow-card hover:shadow-lg transition-all duration-300">
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-primary-glow/10 flex items-center justify-center">
              <Play className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Ready to Drive?</h3>
              <p className="text-muted-foreground mb-6">
                Start monitoring your phone usage and improve your driving safety
              </p>
              <Button 
                variant="hero" 
                size="lg" 
                onClick={onStartTrip}
                className="w-full max-w-xs"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Trip
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50 shadow-card hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Trips</p>
                <p className="text-2xl font-bold">{stats.totalTrips}</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <Car className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-card hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Distraction Time</p>
                <p className="text-2xl font-bold">{Math.round(stats.totalDistractionTime)}m</p>
              </div>
              <div className="p-3 rounded-xl bg-warning/10">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-card hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Risk</p>
                <div className="flex items-center gap-2">
                  <p className={`text-2xl font-bold ${getRiskColor(stats.averageRiskScore)}`}>
                    {Math.round(stats.averageRiskScore)}
                  </p>
                  {stats.improvement > 0 ? (
                    <TrendingDown className="h-4 w-4 text-accent" />
                  ) : stats.improvement < 0 ? (
                    <TrendingUp className="h-4 w-4 text-destructive" />
                  ) : null}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-accent/10">
                <Target className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trips */}
      <Card className="border-border/50 shadow-card">
        <CardHeader>
          <CardTitle>Recent Trips</CardTitle>
          <CardDescription>Your latest driving sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTrips.length > 0 ? (
            <div className="space-y-3">
              {recentTrips.slice(0, 5).map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => onViewTrip(trip)}
                  className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/30 cursor-pointer transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      trip.riskScore <= 30 ? 'bg-accent/10' : 
                      trip.riskScore <= 60 ? 'bg-warning/10' : 'bg-destructive/10'
                    }`}>
                      {trip.riskScore <= 30 ? 
                        <CheckCircle className="h-4 w-4 text-accent" /> :
                        <AlertTriangle className={`h-4 w-4 ${trip.riskScore <= 60 ? 'text-warning' : 'text-destructive'}`} />
                      }
                    </div>
                    <div>
                      <p className="font-medium">{formatTime(trip.startTime)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDuration(trip.duration)} • {trip.distractions.length} distractions
                      </p>
                    </div>
                  </div>
                  <Badge variant={getRiskBadgeVariant(trip.riskScore)}>
                    {trip.riskScore}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No trips yet. Start your first trip to see data here!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};