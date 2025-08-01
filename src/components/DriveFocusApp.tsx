import { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { TripTracker } from '@/components/trip/TripTracker';
import { TripReview } from '@/components/trip/TripReview';
import { TripHistory } from '@/components/trip/TripHistory';
import { UserProfile } from '@/components/profile/UserProfile';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useTrip } from '@/hooks/useTrip';
import { Trip } from '@/types/trip';
import { LogOut, History, User } from 'lucide-react';
type ViewState = 'dashboard' | 'trip-active' | 'trip-review' | 'trip-history' | 'profile';
export const DriveFocusApp = () => {
  const {
    user,
    isLoading: authLoading,
    login,
    signup,
    logout,
    updateUser,
    isAuthenticated
  } = useAuth();
  const {
    currentTrip,
    trips,
    stats,
    startTrip,
    endTrip,
    addDistraction
  } = useTrip();
  const [isSignup, setIsSignup] = useState(false);
  const [view, setView] = useState<ViewState>('dashboard');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  // Handle authentication
  const handleAuth = async (email: string, password: string, name?: string) => {
    if (isSignup && name) {
      return await signup(email, password, name);
    } else {
      return await login(email, password);
    }
  };

  // Handle trip start
  const handleStartTrip = () => {
    startTrip();
    setView('trip-active');
  };

  // Handle trip end
  const handleEndTrip = () => {
    const completedTrip = endTrip();
    if (completedTrip) {
      setSelectedTrip(completedTrip);
      setView('trip-review');
    } else {
      setView('dashboard');
    }
  };

  // Handle trip selection
  const handleViewTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setView('trip-review');
  };

  // Handle back navigation
  const handleBack = () => {
    setView('dashboard');
    setSelectedTrip(null);
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginForm onLogin={handleAuth} onToggleMode={() => setIsSignup(!isSignup)} isSignup={isSignup} isLoading={authLoading} />;
  }

  // Auto-switch to trip tracker if trip is active
  if (currentTrip && view === 'dashboard') {
    setView('trip-active');
  }

  // Navigation header for authenticated views
  const renderHeader = () => {
    if (view === 'trip-active' || view === 'trip-review' || view === 'trip-history' || view === 'profile') {
      return null; // These views handle their own headers
    }
    return <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center justify-between p-4 bg-primary/10 rounded-none">
          <Button
            variant="ghost"
            className="flex items-center gap-2 p-2"
            onClick={() => setView('profile')}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="text-xs bg-primary/20 text-primary">
                {user?.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{user?.name}</span>
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setView('trip-history')}>
              <History className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>;
  };

  // Render current view
  const renderView = () => {
    const recentTrips = trips.slice(-10);
    switch (view) {
      case 'trip-active':
        if (!currentTrip) {
          setView('dashboard');
          return null;
        }
        return <TripTracker trip={currentTrip} onEndTrip={handleEndTrip} onAddDistraction={addDistraction} />;
      case 'trip-review':
        if (!selectedTrip) {
          setView('dashboard');
          return null;
        }
        return <TripReview trip={selectedTrip} onBack={handleBack} allTrips={trips} />;
      case 'trip-history':
        return <TripHistory trips={trips} stats={stats} onBack={handleBack} onViewTrip={handleViewTrip} />;
      case 'profile':
        if (!user) return null;
        return <UserProfile user={user} onBack={handleBack} onUpdateUser={updateUser} />;
      default:
        return <div className="pt-20">
            <Dashboard stats={stats} currentTrip={currentTrip} recentTrips={recentTrips} onStartTrip={handleStartTrip} onViewTrip={handleViewTrip} />
          </div>;
    }
  };
  return <div className="min-h-screen bg-background">
      {renderHeader()}
      {renderView()}
    </div>;
};