import { useState } from "react";
import { User, Mail, Lock, Bell, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function PatientProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: user?.name || "", email: user?.email || "" });
  const [notifications, setNotifications] = useState({ email: true, push: true, critical: true });

  const handleSave = () => {
    toast({ title: "Profile Updated", description: "Your changes have been saved." });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="pl-10" />
              </div>
            </div>
            <Button onClick={handleSave} className="gap-2"><Save className="h-4 w-4" />Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Email Notifications</Label>
              <Switch checked={notifications.email} onCheckedChange={(v) => setNotifications({...notifications, email: v})} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Push Notifications</Label>
              <Switch checked={notifications.push} onCheckedChange={(v) => setNotifications({...notifications, push: v})} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Critical Alerts</Label>
              <Switch checked={notifications.critical} onCheckedChange={(v) => setNotifications({...notifications, critical: v})} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
