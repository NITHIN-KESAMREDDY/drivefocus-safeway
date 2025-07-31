import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Square, 
  Phone, 
  AlertTriangle, 
  Shield, 
  Target,
  Zap,
  Clock
} from 'lucide-react';
import { Trip } from '@/types/trip';
import { formatDuration } from '@/lib/formatters';
import { useToast } from '@/hooks/use-toast';

interface TripTrackerProps {
  trip: Trip;
  onEndTrip: () => void;
  onAddDistraction: () => void;
}

export const TripTracker = ({ trip, onEndTrip, onAddDistraction }: TripTrackerProps) => {
  const [showAlert, setShowAlert] = useState(false);
  const { toast } = useToast();

  // Calculate current risk score
  const currentRiskScore = Math.min(
    Math.round((trip.distractions.length / Math.max(trip.duration / 60, 1)) * 20), 
    100
  );

  // Show alert when risk score is high
  useEffect(() => {
    if (currentRiskScore > 60 && !showAlert) {
      setShowAlert(true);
      toast({
        title: "High Distraction Alert",
        description: "Please focus on driving and avoid phone usage.",
        variant: "destructive"
      });
      
      // Hide alert after 5 seconds
      setTimeout(() => setShowAlert(false), 5000);
    }
  }, [currentRiskScore, showAlert, toast]);

  // Simulate phone usage detection (for demo)
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly trigger distraction events (10% chance every 30 seconds)
      if (Math.random() < 0.1) {
        onAddDistraction();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [onAddDistraction]);

  const getRiskColor = (score: number) => {
    if (score <= 30) return 'text-accent';
    if (score <= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getRiskLevel = (score: number) => {
    if (score <= 30) return 'Low';
    if (score <= 60) return 'Medium';
    return 'High';
  };

  const getRiskIcon = (score: number) => {
    if (score <= 30) return <Shield className="h-5 w-5 text-accent" />;
    if (score <= 60) return <Target className="h-5 w-5 text-warning" />;
    return <AlertTriangle className="h-5 w-5 text-destructive" />;
  };

  const handleEndTrip = () => {
    onEndTrip();
    toast({
      title: "Trip Completed",
      description: "Your trip has been saved and analyzed",
      variant: "default"
    });
  };

  // Add manual distraction for demo purposes
  const handleManualDistraction = () => {
    onAddDistraction();
    toast({
      title: "Phone Usage Detected",
      description: "Distraction event logged",
      variant: "destructive"
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
          <h1 className="text-2xl font-bold text-primary">Trip Active</h1>
        </div>
        <Badge variant="outline" className="border-primary text-primary animate-pulse">
          Live
        </Badge>
      </div>

      {/* High Risk Alert */}
      {showAlert && currentRiskScore > 60 && (
        <Alert className="border-destructive/50 bg-destructive/10 animate-slide-up">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive font-medium">
            High distraction level detected! Please focus on driving and avoid phone usage.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Trip Info */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary-glow/5 shadow-glow">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">{formatDuration(trip.duration)}</CardTitle>
          <p className="text-muted-foreground">Trip Duration</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Risk Score Display */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              {getRiskIcon(currentRiskScore)}
              <div>
                <div className={`text-4xl font-bold ${getRiskColor(currentRiskScore)}`}>
                  {currentRiskScore}
                </div>
                <div className="text-sm text-muted-foreground">Risk Score</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Risk Level: {getRiskLevel(currentRiskScore)}</span>
                <span className={getRiskColor(currentRiskScore)}>
                  {currentRiskScore}%
                </span>
              </div>
              <Progress 
                value={currentRiskScore} 
                className="h-3"
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-xl bg-muted/30">
              <Phone className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <div className="text-2xl font-bold">{trip.distractions.length}</div>
              <div className="text-sm text-muted-foreground">Distractions</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/30">
              <Clock className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <div className="text-2xl font-bold">
                {Math.round(trip.distractions.reduce((acc, d) => acc + d.duration, 0) / 60)}m
              </div>
              <div className="text-sm text-muted-foreground">Distracted</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              variant="danger" 
              size="lg" 
              className="w-full"
              onClick={handleEndTrip}
            >
              <Square className="h-5 w-5 mr-2" />
              End Trip
            </Button>
            
            {/* Demo Button - Remove in production */}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full opacity-50"
              onClick={handleManualDistraction}
            >
              <Zap className="h-4 w-4 mr-2" />
              Simulate Phone Usage (Demo)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Distractions */}
      {trip.distractions.length > 0 && (
        <Card className="border-border/50 shadow-card">
          <CardHeader>
            <CardTitle>Recent Distractions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {trip.distractions.slice(-5).reverse().map((distraction) => (
                <div
                  key={distraction.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-destructive" />
                    <div>
                      <p className="text-sm font-medium">Phone Usage</p>
                      <p className="text-xs text-muted-foreground">
                        {distraction.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {distraction.duration}s
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Safety Tips */}
      <Card className="border-accent/30 bg-accent/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-accent mt-1" />
            <div>
              <h3 className="font-semibold text-accent mb-2">Safety Reminder</h3>
              <p className="text-sm text-muted-foreground">
                Keep your phone in silent mode and avoid using it while driving. 
                Your safety and the safety of others depends on your full attention to the road.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};