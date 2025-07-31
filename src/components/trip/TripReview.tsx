import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Phone, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  TrendingDown,
  Calendar,
  MapPin,
  Target
} from 'lucide-react';
import { Trip } from '@/types/trip';
import { formatDuration, formatTime, formatDate } from '@/lib/formatters';

interface TripReviewProps {
  trip: Trip;
  onBack: () => void;
  allTrips: Trip[];
}

export const TripReview = ({ trip, onBack, allTrips }: TripReviewProps) => {
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

  const getRiskLevel = (score: number) => {
    if (score <= 30) return 'Low Risk';
    if (score <= 60) return 'Medium Risk';
    return 'High Risk';
  };

  // Calculate comparison with previous trips
  const previousTrips = allTrips.filter(t => t.id !== trip.id && t.endTime).slice(-5);
  const avgPreviousScore = previousTrips.length > 0 
    ? previousTrips.reduce((acc, t) => acc + t.riskScore, 0) / previousTrips.length 
    : 0;
  const improvement = avgPreviousScore > 0 ? ((avgPreviousScore - trip.riskScore) / avgPreviousScore) * 100 : 0;

  const totalDistractionTime = trip.distractions.reduce((acc, d) => acc + d.duration, 0);
  const distractionPercentage = trip.duration > 0 ? (totalDistractionTime / trip.duration) * 100 : 0;

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Trip Review</h1>
          <p className="text-muted-foreground">{formatDate(trip.startTime)}</p>
        </div>
      </div>

      {/* Trip Summary Card */}
      <Card className="border-border/50 shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Trip Summary</CardTitle>
              <CardDescription>{formatTime(trip.startTime)}</CardDescription>
            </div>
            <Badge variant={getRiskBadgeVariant(trip.riskScore)} className="text-lg px-3 py-1">
              {trip.riskScore}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Risk Score Display */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              {trip.riskScore <= 30 ? 
                <CheckCircle className="h-8 w-8 text-accent" /> :
                <AlertTriangle className={`h-8 w-8 ${trip.riskScore <= 60 ? 'text-warning' : 'text-destructive'}`} />
              }
              <div>
                <div className={`text-4xl font-bold ${getRiskColor(trip.riskScore)}`}>
                  {trip.riskScore}
                </div>
                <div className="text-sm text-muted-foreground">{getRiskLevel(trip.riskScore)}</div>
              </div>
            </div>
            
            <Progress value={trip.riskScore} className="h-3" />
            
            {/* Improvement Indicator */}
            {previousTrips.length > 0 && (
              <div className="flex items-center justify-center gap-2 text-sm">
                {improvement > 0 ? (
                  <>
                    <TrendingDown className="h-4 w-4 text-accent" />
                    <span className="text-accent">
                      {Math.round(improvement)}% improvement from recent trips
                    </span>
                  </>
                ) : improvement < 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-destructive" />
                    <span className="text-destructive">
                      {Math.round(Math.abs(improvement))}% higher than recent trips
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">Similar to recent trips</span>
                )}
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-xl bg-muted/30">
              <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-xl font-bold">{formatDuration(trip.duration)}</div>
              <div className="text-sm text-muted-foreground">Total Time</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/30">
              <Phone className="h-6 w-6 mx-auto mb-2 text-destructive" />
              <div className="text-xl font-bold">{trip.distractions.length}</div>
              <div className="text-sm text-muted-foreground">Distractions</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/30">
              <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-warning" />
              <div className="text-xl font-bold">{Math.round(totalDistractionTime / 60)}m</div>
              <div className="text-sm text-muted-foreground">Distracted</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/30">
              <Target className="h-6 w-6 mx-auto mb-2 text-accent" />
              <div className="text-xl font-bold">{Math.round(distractionPercentage)}%</div>
              <div className="text-sm text-muted-foreground">Distraction Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distraction Timeline */}
      <Card className="border-border/50 shadow-card">
        <CardHeader>
          <CardTitle>Distraction Timeline</CardTitle>
          <CardDescription>
            {trip.distractions.length > 0 
              ? `${trip.distractions.length} phone usage events detected during this trip`
              : 'No distractions detected - excellent driving!'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trip.distractions.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {trip.distractions.map((distraction, index) => {
                const minutesFromStart = Math.floor(
                  (distraction.timestamp.getTime() - trip.startTime.getTime()) / 1000 / 60
                );
                
                return (
                  <div
                    key={distraction.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                        <Phone className="h-4 w-4 text-destructive" />
                      </div>
                      <div>
                        <p className="font-medium">Phone Usage #{index + 1}</p>
                        <p className="text-sm text-muted-foreground">
                          {minutesFromStart}m into trip • {distraction.duration}s duration
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {distraction.timestamp.toLocaleTimeString()}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-accent" />
              <h3 className="text-lg font-semibold text-accent mb-2">Perfect Trip!</h3>
              <p className="text-muted-foreground">
                No phone distractions were detected during this trip. Keep up the excellent driving!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights and Recommendations */}
      <Card className="border-accent/30 bg-accent/5">
        <CardHeader>
          <CardTitle className="text-accent">Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trip.riskScore <= 30 ? (
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-accent mt-1" />
                <div>
                  <h4 className="font-semibold text-accent">Excellent Driving!</h4>
                  <p className="text-sm text-muted-foreground">
                    You maintained excellent focus during this trip. Keep up the safe driving habits!
                  </p>
                </div>
              </div>
            ) : trip.riskScore <= 60 ? (
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning mt-1" />
                <div>
                  <h4 className="font-semibold text-warning">Room for Improvement</h4>
                  <p className="text-sm text-muted-foreground">
                    Consider putting your phone in Do Not Disturb mode or placing it out of reach while driving.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive mt-1" />
                <div>
                  <h4 className="font-semibold text-destructive">High Distraction Level</h4>
                  <p className="text-sm text-muted-foreground">
                    This trip had a high level of phone distractions. Please prioritize road safety and minimize phone usage while driving.
                  </p>
                </div>
              </div>
            )}

            {improvement > 10 && (
              <div className="flex items-start gap-3">
                <TrendingDown className="h-5 w-5 text-accent mt-1" />
                <div>
                  <h4 className="font-semibold text-accent">Great Progress!</h4>
                  <p className="text-sm text-muted-foreground">
                    You've significantly improved compared to your recent trips. Keep building on this positive trend!
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};