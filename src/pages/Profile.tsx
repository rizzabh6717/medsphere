import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import NavigationHeader from "@/components/NavigationHeader";
import { getUserProfile, saveUserProfile, getAppointments, getFamilyMembers } from "@/lib/storage";
import { logout } from "@/lib/auth";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Shield,
  Bell,
  CreditCard,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    dob: "",
    bloodGroup: "",
    gender: "",
  });

  useEffect(() => {
    const profile = getUserProfile();
    if (profile) {
      setProfileData(profile);
    }
  }, []);

  const [notifications, setNotifications] = useState({
    appointments: true,
    reminders: true,
    promotions: false,
    updates: true,
  });

  const appointmentsCount = getAppointments().length;
  const familyMembersCount = getFamilyMembers().length;
  const completedAppointments = getAppointments().filter(apt => apt.status === 'completed').length;

  const stats = [
    { label: "Appointments", value: appointmentsCount.toString(), icon: Calendar },
    { label: "Family Members", value: familyMembersCount.toString(), icon: User },
    { label: "Completed", value: completedAppointments.toString(), icon: Badge },
  ];

  const handleSave = () => {
    saveUserProfile(profileData);
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-medical pb-20">
      <NavigationHeader />
      
      <div className="container mx-auto px-4 max-w-4xl py-8">
        {/* Profile Header */}
        <Card className="p-6 mb-6 animate-fade-in">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-card flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{profileData.name}</h2>
                <p className="text-muted-foreground">{profileData.email}</p>
                <Badge variant="secondary" className="mt-2">
                  Verified Account
                </Badge>
              </div>
            </div>
            <Button
              variant={isEditing ? "default" : "outline"}
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center p-4 bg-accent/30 rounded-lg animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <stat.icon className="w-5 h-5 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Profile Details */}
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4 mt-6">
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      disabled={!isEditing}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled={!isEditing}
                      onChange={(e) =>
                        setProfileData({ ...profileData, email: e.target.value })
                      }
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      disabled={!isEditing}
                      onChange={(e) =>
                        setProfileData({ ...profileData, phone: e.target.value })
                      }
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={profileData.dob}
                      disabled={!isEditing}
                      onChange={(e) =>
                        setProfileData({ ...profileData, dob: e.target.value })
                      }
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bloodGroup">Blood Group</Label>
                    <Input
                      id="bloodGroup"
                      value={profileData.bloodGroup}
                      disabled={!isEditing}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          bloodGroup: e.target.value,
                        })
                      }
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Input
                      id="gender"
                      value={profileData.gender}
                      disabled={!isEditing}
                      onChange={(e) =>
                        setProfileData({ ...profileData, gender: e.target.value })
                      }
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={profileData.address}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfileData({ ...profileData, address: e.target.value })
                    }
                    className="mt-1.5"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 mt-6">
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notification Preferences
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Appointment Reminders</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified about upcoming appointments
                    </p>
                  </div>
                  <Switch
                    checked={notifications.appointments}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, appointments: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Medication Reminders</p>
                    <p className="text-sm text-muted-foreground">
                      Reminders to take your medications
                    </p>
                  </div>
                  <Switch
                    checked={notifications.reminders}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, reminders: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Promotional Emails</p>
                    <p className="text-sm text-muted-foreground">
                      Receive offers and health tips
                    </p>
                  </div>
                  <Switch
                    checked={notifications.promotions}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, promotions: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Platform Updates</p>
                    <p className="text-sm text-muted-foreground">
                      News about new features and improvements
                    </p>
                  </div>
                  <Switch
                    checked={notifications.updates}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, updates: checked })
                    }
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment Methods
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Manage your saved payment methods
              </p>
              <Button variant="outline" className="w-full">
                Add Payment Method
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4 mt-6">
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Security Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <Label>Change Password</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Last changed 3 months ago
                  </p>
                  <Button variant="outline">Update Password</Button>
                </div>

                <div className="pt-4 border-t">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Add an extra layer of security to your account
                  </p>
                  <Button variant="outline">Enable 2FA</Button>
                </div>

                <div className="pt-4 border-t">
                  <Label>Active Sessions</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Manage devices where you're logged in
                  </p>
                  <Button variant="outline">View Sessions</Button>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-destructive/50">
              <h3 className="font-bold text-lg mb-2 text-destructive">
                Danger Zone
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Irreversible actions that affect your account
              </p>
              <div className="space-y-3">
                <Button variant="outline" className="w-full">
                  Download My Data
                </Button>
                <Button variant="destructive" className="w-full">
                  Delete Account
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Logout Button */}
        <Card className="p-4 mt-6">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
