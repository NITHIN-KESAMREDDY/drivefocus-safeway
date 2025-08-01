import { useState } from 'react';
import { User } from '@/types/trip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Camera, Shield, Bell, Palette, Car, MapPin, Phone, User as UserIcon, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserProfileProps {
  user: User;
  onBack: () => void;
  onUpdateUser: (updatedUser: User) => void;
}

export const UserProfile = ({ user, onBack, onUpdateUser }: UserProfileProps) => {
  const [editedUser, setEditedUser] = useState<User>(user);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    onUpdateUser(editedUser);
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const updatePreference = (key: keyof User['preferences'], value: any) => {
    setEditedUser(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  const updateDrivingProfile = (key: keyof User['drivingProfile'], value: any) => {
    setEditedUser(prev => ({
      ...prev,
      drivingProfile: {
        ...prev.drivingProfile,
        [key]: value
      }
    }));
  };

  const updateEmergencyContact = (key: string, value: string) => {
    setEditedUser(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact!,
        [key]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-foreground/70 hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Profile</h1>
        <div className="w-10" />
      </div>

      <div className="max-w-md mx-auto space-y-6">
        {/* Profile Header Card */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={editedUser.avatar} />
                  <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                    {editedUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="text-center space-y-1">
                {isEditing ? (
                  <Input
                    value={editedUser.name}
                    onChange={(e) => setEditedUser(prev => ({ ...prev, name: e.target.value }))}
                    className="text-center font-semibold text-lg"
                  />
                ) : (
                  <h2 className="font-semibold text-lg">{user.name}</h2>
                )}
                <p className="text-muted-foreground text-sm">{user.email}</p>
                <p className="text-xs text-muted-foreground">
                  Member since {user.createdAt.toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserIcon className="h-4 w-4" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={editedUser.phone || ''}
                  onChange={(e) => setEditedUser(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                />
              ) : (
                <p className="text-sm text-muted-foreground">{user.phone || 'Not provided'}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              {isEditing ? (
                <Input
                  id="location"
                  value={editedUser.location || ''}
                  onChange={(e) => setEditedUser(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="City, State"
                />
              ) : (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {user.location || 'Not provided'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Phone className="h-4 w-4" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emergency-name">Name</Label>
              {isEditing ? (
                <Input
                  id="emergency-name"
                  value={editedUser.emergencyContact?.name || ''}
                  onChange={(e) => updateEmergencyContact('name', e.target.value)}
                  placeholder="Contact name"
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {user.emergencyContact?.name || 'Not provided'}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="emergency-phone">Phone</Label>
              {isEditing ? (
                <Input
                  id="emergency-phone"
                  value={editedUser.emergencyContact?.phone || ''}
                  onChange={(e) => updateEmergencyContact('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {user.emergencyContact?.phone || 'Not provided'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Driving Profile */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Car className="h-4 w-4" />
              Driving Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Experience Level</Label>
              {isEditing ? (
                <Select
                  value={editedUser.drivingProfile.experienceLevel}
                  onValueChange={(value) => updateDrivingProfile('experienceLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (2-5 years)</SelectItem>
                    <SelectItem value="experienced">Experienced (5+ years)</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground capitalize">
                  {user.drivingProfile.experienceLevel}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vehicle">Vehicle Type</Label>
              {isEditing ? (
                <Input
                  id="vehicle"
                  value={editedUser.drivingProfile.vehicleType}
                  onChange={(e) => updateDrivingProfile('vehicleType', e.target.value)}
                  placeholder="e.g., Sedan, SUV, Truck"
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {user.drivingProfile.vehicleType || 'Not specified'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Palette className="h-4 w-4" />
              App Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Theme</Label>
                <p className="text-xs text-muted-foreground">App appearance</p>
              </div>
              {isEditing ? (
                <Select
                  value={editedUser.preferences.theme}
                  onValueChange={(value) => updatePreference('theme', value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <span className="text-sm text-muted-foreground capitalize">
                  {user.preferences.theme}
                </span>
              )}
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Bell className="h-3 w-3" />
                  Notifications
                </Label>
                <p className="text-xs text-muted-foreground">Push notifications</p>
              </div>
              <Switch
                checked={editedUser.preferences.notifications}
                onCheckedChange={(checked) => updatePreference('notifications', checked)}
                disabled={!isEditing}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sound Alerts</Label>
                <p className="text-xs text-muted-foreground">Audio feedback</p>
              </div>
              <Switch
                checked={editedUser.preferences.soundAlerts}
                onCheckedChange={(checked) => updatePreference('soundAlerts', checked)}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  Risk Threshold
                </Label>
                <span className="text-sm text-muted-foreground">
                  {editedUser.preferences.riskThreshold}%
                </span>
              </div>
              <Slider
                value={[editedUser.preferences.riskThreshold]}
                onValueChange={(value) => updatePreference('riskThreshold', value[0])}
                max={100}
                step={5}
                disabled={!isEditing}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Alert when distraction risk exceeds this threshold
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <Button onClick={handleCancel} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="w-full">
              Edit Profile
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};