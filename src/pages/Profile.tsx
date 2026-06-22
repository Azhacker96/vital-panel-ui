import { useState, useEffect } from "react";
import { User, Mail, Lock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export default function Profile() {
  const { user, refreshProfile } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [updatingPwd, setUpdatingPwd] = useState(false);

  useEffect(() => {
    if (!user) return;
    setEmail(user.email);
    const fetch = async () => {
      const { data } = await supabase.from('profiles').select('first_name,last_name,phone').eq('id', user.id).maybeSingle();
      setFirstName(data?.first_name ?? '');
      setLastName(data?.last_name ?? '');
      setPhone(data?.phone ?? '');
    };
    fetch();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone: phone.trim() || null,
    }).eq('id', user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    await refreshProfile();
    toast({ title: "Profile Updated", description: "Your profile information has been saved successfully." });
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Password too short", description: "Use at least 6 characters.", variant: "destructive" });
      return;
    }
    setUpdatingPwd(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setUpdatingPwd(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Password Updated", description: "Your password has been changed successfully." });
    setNewPassword("");
    setConfirmPassword("");
  };

  const initials = user?.name
    ? user.name.split(/\s+/).map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

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
              {initials}
            </div>
            <div>
              <Button variant="outline" size="sm">Change Photo</Button>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG. Max 2MB</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="first">First name</Label>
                <Input id="first" value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={80} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last">Last name</Label>
                <Input id="last" value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={80} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={32} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  readOnly
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">Contact an admin to change your email.</p>
            </div>
            <Button onClick={handleSaveProfile} disabled={saving} className="w-full gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Saving…" : "Save Changes"}
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
            <Button onClick={handleUpdatePassword} disabled={updatingPwd} className="w-full gap-2">
              <Lock className="h-4 w-4" />
              {updatingPwd ? "Updating…" : "Update Password"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
