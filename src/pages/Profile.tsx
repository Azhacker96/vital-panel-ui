import { useState } from "react";
import { User, Mail, Lock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

export default function Profile() {
  const [name, setName] = useState("Admin User");
  const [email, setEmail] = useState("admin@medadmin.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handleUpdatePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully.",
    });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Information */}
        <div className="rounded-lg border bg-card p-6 card-shadow animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-lg bg-secondary/10 p-2">
              <User className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Profile Information</h3>
              <p className="text-sm text-muted-foreground">Update your personal details</p>
            </div>
          </div>

          <div className="flex items-center gap-6 mb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
              AU
            </div>
            <div>
              <Button variant="outline" size="sm">Change Photo</Button>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG. Max 2MB</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Button onClick={handleSaveProfile} className="w-full gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Password Update */}
        <div className="rounded-lg border bg-card p-6 card-shadow animate-slide-up" style={{ animationDelay: "50ms" }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-lg bg-secondary/10 p-2">
              <Lock className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Update Password</h3>
              <p className="text-sm text-muted-foreground">Change your account password</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pl-9"
                  placeholder="Enter current password"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-9"
                  placeholder="Enter new password"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-9"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <Button onClick={handleUpdatePassword} className="w-full gap-2">
              <Lock className="h-4 w-4" />
              Update Password
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
