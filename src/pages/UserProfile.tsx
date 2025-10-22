/**
 * User Profile Page
 * Manage user account settings and profile information
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Mail, Phone, MapPin, Lock, CheckCircle, Shield } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const UserProfile = () => {
  const { user, profile, updateUserProfile, updatePassword, loading, isAdmin } = useAuth();
  
  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    street: profile?.address?.street || '',
    city: profile?.address?.city || '',
    state: profile?.address?.state || '',
    postal_code: profile?.address?.postal_code || '',
    country: profile?.address?.country || 'India',
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        street: profile.address?.street || '',
        city: profile.address?.city || '',
        state: profile.address?.state || '',
        postal_code: profile.address?.postal_code || '',
        country: profile.address?.country || 'India',
      });
    }
  }, [profile]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError('');
    setSuccess('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError('');
    setSuccess('');
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUpdating(true);

    try {
      const result = await updateUserProfile({
        full_name: profileData.full_name,
        phone: profileData.phone,
        address: {
          street: profileData.street,
          city: profileData.city,
          state: profileData.state,
          postal_code: profileData.postal_code,
          country: profileData.country,
        },
      });

      if (result.success) {
        setSuccess('Profile updated successfully!');
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setUpdating(true);

    try {
      const result = await updatePassword(passwordData.newPassword);

      if (result.success) {
        setSuccess('Password updated successfully!');
        setPasswordData({ newPassword: '', confirmPassword: '' });
      } else {
        setError(result.error || 'Failed to update password');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setUpdating(false);
    }
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">My Account</h1>
            <p className="text-muted-foreground">Manage your profile and account settings</p>
          </div>

          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="text-xl bg-accent text-white">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold">{profile?.full_name || 'User'}</h2>
                    {isAdmin && (
                      <Badge variant="default" className="bg-accent">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {user?.email}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for different sections */}
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Profile Information</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            {/* Profile Information Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and contact details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    {success && (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          {success}
                        </AlertDescription>
                      </Alert>
                    )}

                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Personal Information
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="full_name">Full Name</Label>
                          <Input
                            id="full_name"
                            name="full_name"
                            value={profileData.full_name}
                            onChange={handleProfileChange}
                            disabled={updating}
                            placeholder="John Doe"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={profileData.phone}
                            onChange={handleProfileChange}
                            disabled={updating}
                            placeholder="+91 98765 43210"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Address Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Address
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="street">Street Address</Label>
                          <Input
                            id="street"
                            name="street"
                            value={profileData.street}
                            onChange={handleProfileChange}
                            disabled={updating}
                            placeholder="123 Main Street"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              name="city"
                              value={profileData.city}
                              onChange={handleProfileChange}
                              disabled={updating}
                              placeholder="Mumbai"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input
                              id="state"
                              name="state"
                              value={profileData.state}
                              onChange={handleProfileChange}
                              disabled={updating}
                              placeholder="Maharashtra"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="postal_code">Postal Code</Label>
                            <Input
                              id="postal_code"
                              name="postal_code"
                              value={profileData.postal_code}
                              onChange={handleProfileChange}
                              disabled={updating}
                              placeholder="400001"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Input
                              id="country"
                              name="country"
                              value={profileData.country}
                              onChange={handleProfileChange}
                              disabled={updating}
                              placeholder="India"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="btn-gold" disabled={updating}>
                      {updating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your password and account security
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    {success && (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          {success}
                        </AlertDescription>
                      </Alert>
                    )}

                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Change Password
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            disabled={updating}
                            placeholder="Enter new password"
                          />
                          <p className="text-xs text-muted-foreground">
                            Must be at least 8 characters long
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            disabled={updating}
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="btn-gold" disabled={updating}>
                      {updating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserProfile;

