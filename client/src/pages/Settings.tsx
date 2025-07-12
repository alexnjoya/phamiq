import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Bot,
  History,
  Settings as SettingsIcon,
  Plus,
  Search,
  User,
  Bell,
  Globe,
  Shield,
  Download,
  Trash2,
  Save,
  Eye,
  EyeOff,
  AlertTriangle
} from "lucide-react";
import SidebarLayout from '../components/SidebarLayout';
import { userService, UserProfile, UpdateProfileRequest, ChangePasswordRequest, NotificationSettings, LanguageSettings } from '../api/userService';

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profileOpen, setProfileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileForm, setProfileForm] = useState<UpdateProfileRequest>({});
  
  // Password state
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState<ChangePasswordRequest>({
    old_password: '',
    new_password: ''
  });
  
  // Notifications state
  const [notifications, setNotifications] = useState<NotificationSettings>({
    analysis_results: true,
    disease_alerts: true
  });
  
  // Language state
  const [languageSettings, setLanguageSettings] = useState<LanguageSettings>({
    language: 'en',
    timezone: 'GMT'
  });

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'tw', name: 'Twi' },
    { code: 'ev', name: 'Ewe' },
    { code: 'dag', name: 'Dagbani' }
  ];

  const timezones = [
    { code: 'GMT', name: 'GMT (Greenwich Mean Time)' },
    { code: 'WAT', name: 'WAT (West Africa Time)' },
    { code: 'EAT', name: 'EAT (East Africa Time)' }
  ];

  const sidebarItems = [
    { icon: Plus, label: 'Analysis', href: '/upload' },
    { icon: History, label: 'History', href: '/history' },
    { icon: Bot, label: 'Chat', href: '/chat' },
    { icon: Search, label: 'Discovery', href: '/discovery' },
    { icon: SettingsIcon, label: 'Settings', href: '/settings', active: true },
  ];

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await userService.getProfile();
      setProfile(userProfile);
      setProfileForm({
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        email: userProfile.email || '',
        location: userProfile.location || ''
      });
      setNotifications(userProfile.notifications || {
        analysis_results: true,
        disease_alerts: true
      });
      setLanguageSettings({
        language: userProfile.language || 'en',
        timezone: userProfile.timezone || 'GMT'
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleProfileUpdate = async () => {
    try {
      setSaving(true);
      
      // Only include profile fields that have actual values
      const cleanedData: UpdateProfileRequest = {};
      if (profileForm.first_name?.trim()) cleanedData.first_name = profileForm.first_name.trim();
      if (profileForm.last_name?.trim()) cleanedData.last_name = profileForm.last_name.trim();
      if (profileForm.email?.trim()) cleanedData.email = profileForm.email.trim();
      if (profileForm.location?.trim()) cleanedData.location = profileForm.location.trim();
      
      // Check if we have any data to update
      if (Object.keys(cleanedData).length === 0) {
        toast({
          title: "No Changes",
          description: "No changes to save",
          variant: "default"
        });
        return;
      }
      
      console.log('Sending profile data:', cleanedData);
      await userService.updateProfile(cleanedData);
      await loadUserProfile(); // Reload to get updated data
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.old_password && passwordForm.new_password) {
      try {
        setSaving(true);
        await userService.changePassword(passwordForm);
        setPasswordForm({ old_password: '', new_password: '' });
        toast({
          title: "Success",
          description: "Password changed successfully"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to change password",
          variant: "destructive"
        });
      } finally {
        setSaving(false);
      }
    }
  };

  const handleNotificationToggle = async (key: keyof NotificationSettings) => {
    const newSettings = { ...notifications, [key]: !notifications[key] };
    setNotifications(newSettings);
    
    try {
      await userService.updateNotifications(newSettings);
      toast({
        title: "Success",
        description: "Notification settings updated"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive"
      });
      // Revert on error
      setNotifications(notifications);
    }
  };

  const handleLanguageUpdate = async () => {
    try {
      setSaving(true);
      await userService.updateLanguage(languageSettings);
      toast({
        title: "Success",
        description: "Language settings updated"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update language settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadData = async () => {
    try {
      const blob = await userService.downloadUserData();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'user_data.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Success",
        description: "Data downloaded successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download data",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await userService.deleteAccount();
        localStorage.clear();
        navigate('/login');
        toast({
          title: "Account Deleted",
          description: "Your account has been successfully deleted"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete account",
          variant: "destructive"
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <SidebarLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading settings...</p>
          </div>
        </div>
        </SidebarLayout>
      </div>
    );
  }

  return (
    <SidebarLayout>
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen md:ml-24 relative">
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 md:px-6">
          {/* Header */}
          <div className="py-8">
            <h1 className="text-3xl font-light text-gray-900 mb-2">
              Settings
            </h1>
            <p className="text-gray-500">Manage your account preferences and application settings</p>
          </div>

          <div className="space-y-6 mb-8">
            {/* Profile Settings */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={profileForm.first_name || ''}
                      onChange={(e) => setProfileForm({...profileForm, first_name: e.target.value})}
                      placeholder="Enter your first name"
                    />
                  </div>
                <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={profileForm.last_name || ''}
                      onChange={(e) => setProfileForm({...profileForm, last_name: e.target.value})}
                      placeholder="Enter your last name"
                  />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email || ''}
                    onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <Label htmlFor="profession">Profession</Label>
                  <Input
                    id="profession"
                    value={profileForm.location || ''}
                    onChange={(e) => setProfileForm({...profileForm, location: e.target.value})}
                    placeholder="e.g., Student, Farmer, Researcher"
                  />
                </div>
                <Button 
                  onClick={handleProfileUpdate}
                  disabled={saving}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Profile'}
                </Button>
              </CardContent>
            </Card>

            {/* Password Settings */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="old_password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="old_password"
                      type={showPassword ? "text" : "password"}
                      value={passwordForm.old_password}
                      onChange={(e) => setPasswordForm({...passwordForm, old_password: e.target.value})}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="new_password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      type={showPassword ? "text" : "password"}
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                      placeholder="Enter new password"
                    />
                  </div>
                </div>
                <Button 
                  onClick={handlePasswordChange}
                  disabled={saving || !passwordForm.old_password || !passwordForm.new_password}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {saving ? 'Changing...' : 'Change Password'}
                </Button>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Analysis Results</h4>
                    <p className="text-sm text-gray-500">Get notified when your crop analysis is complete</p>
                  </div>
                  <Switch
                    checked={notifications.analysis_results}
                    onCheckedChange={() => handleNotificationToggle('analysis_results')}
                    />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Disease Alerts</h4>
                    <p className="text-sm text-gray-500">Receive alerts about disease outbreaks in your area</p>
                  </div>
                  <Switch
                    checked={notifications.disease_alerts}
                    onCheckedChange={() => handleNotificationToggle('disease_alerts')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Language Settings */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Language & Region
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select 
                    value={languageSettings.language} 
                    onValueChange={(value) => setLanguageSettings({...languageSettings, language: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                    {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                        </SelectItem>
                    ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={languageSettings.timezone} 
                    onValueChange={(value) => setLanguageSettings({...languageSettings, timezone: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.code} value={tz.code}>
                          {tz.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleLanguageUpdate}
                  disabled={saving}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Language Settings'}
                </Button>
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  onClick={handleDownloadData}
                  className="w-full justify-start border-gray-300 hover:bg-gray-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download My Data
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleDeleteAccount}
                  className="w-full justify-start border-red-300 hover:bg-red-50 hover:border-red-400 text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
         {/* Standalone Logout Button */}
      <div className="flex-1 flex flex-col ml-5 lg:ml-44 items-start justify-start pb-8">
                <Button
          className="w-full max-w-xs bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default Settings;
