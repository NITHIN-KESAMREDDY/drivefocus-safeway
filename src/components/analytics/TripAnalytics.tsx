import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Award,
  AlertTriangle,
  Clock,
  Calendar,
  Target,
  Activity
} from 'lucide-react';
import { TripStats } from '@/types/trip';

interface TripAnalyticsProps {
  stats: TripStats;
}

export const TripAnalytics = ({ stats }: TripAnalyticsProps) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingDown className="h-4 w-4 text-accent" />;
      case 'worsening':
        return <TrendingUp className="h-4 w-4 text-destructive" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-accent';
      case 'worsening':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 30) return 'text-accent';
    if (score <= 60) return 'text-warning';
    return 'text-destructive';
  };

  const formatHours = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    return `${hours.toFixed(1)}h`;
  };

  const getMostRiskyHour = () => {
    if (stats.timePatterns.length === 0) return null;
    return stats.timePatterns.reduce((prev, current) => 
      current.averageRisk > prev.averageRisk ? current : prev
    );
  };

  const mostRiskyHour = getMostRiskyHour();

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <Award className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold text-primary">{stats.safeDrivingStreak}</div>
            <div className="text-xs text-muted-foreground">Safe Trips</div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <div className="text-2xl font-bold">{formatHours(stats.totalDrivingTime)}</div>
            <div className="text-xs text-muted-foreground">Total Driving</div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <Activity className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <div className="text-2xl font-bold">{Math.round(stats.averageTripDuration)}m</div>
            <div className="text-xs text-muted-foreground">Avg Trip</div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <Target className={`h-6 w-6 mx-auto mb-2 ${getRiskColor(stats.averageRiskScore)}`} />
            <div className={`text-2xl font-bold ${getRiskColor(stats.averageRiskScore)}`}>
              {Math.round(stats.averageRiskScore)}
            </div>
            <div className="text-xs text-muted-foreground">Avg Risk</div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Trend Analysis */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Risk Trend Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getTrendIcon(stats.riskTrend)}
              <span className={`font-medium ${getTrendColor(stats.riskTrend)}`}>
                {stats.riskTrend.charAt(0).toUpperCase() + stats.riskTrend.slice(1)}
              </span>
            </div>
            <Badge variant={stats.riskTrend === 'improving' ? 'default' : 'secondary'}>
              {stats.improvement > 0 ? '+' : ''}{Math.round(stats.improvement)}%
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Weekly Average Risk</span>
              <span className={getRiskColor(stats.weeklyAverage)}>
                {Math.round(stats.weeklyAverage)}
              </span>
            </div>
            <Progress 
              value={stats.weeklyAverage} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Behavioral Insights */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Behavioral Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div>
              <p className="text-sm font-medium">Most Distractive Day</p>
              <p className="text-xs text-muted-foreground">Day of week with highest risk</p>
            </div>
            <Badge variant="outline" className="border-warning text-warning">
              {stats.mostDistractiveDayOfWeek}
            </Badge>
          </div>

          {mostRiskyHour && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div>
                <p className="text-sm font-medium">Peak Risk Hour</p>
                <p className="text-xs text-muted-foreground">Time with highest distraction risk</p>
              </div>
              <Badge variant="outline" className="border-destructive text-destructive">
                {mostRiskyHour.hourOfDay}:00
              </Badge>
            </div>
          )}

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div>
              <p className="text-sm font-medium">Total Distraction Time</p>
              <p className="text-xs text-muted-foreground">Across all trips</p>
            </div>
            <Badge variant="outline" className="border-warning text-warning">
              {Math.round(stats.totalDistractionTime)}m
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      {stats.monthlyStats.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.monthlyStats.slice(-3).map((month, index) => (
                <div key={month.month} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="text-sm font-medium">{month.month}</p>
                    <p className="text-xs text-muted-foreground">
                      {month.totalTrips} trips • {month.totalDistractions} distractions
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${getRiskColor(month.averageRisk)}`}>
                      {Math.round(month.averageRisk)}
                    </div>
                    <div className="text-xs text-muted-foreground">Risk Score</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Safety Recommendations */}
      <Card className="border-accent/30 bg-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-accent">
            <AlertTriangle className="h-5 w-5" />
            Safety Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.averageRiskScore > 50 && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm font-medium text-destructive">High Risk Detected</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Consider enabling Do Not Disturb mode while driving and keeping your phone out of reach.
                </p>
              </div>
            )}
            
            {stats.safeDrivingStreak < 3 && stats.totalTrips > 3 && (
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                <p className="text-sm font-medium text-warning">Focus on Consistency</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try to maintain a safe driving streak by avoiding phone usage during trips.
                </p>
              </div>
            )}

            {stats.riskTrend === 'improving' && (
              <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                <p className="text-sm font-medium text-accent">Great Progress!</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your driving safety has been improving. Keep up the excellent work!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};