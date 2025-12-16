import { Bell, CheckCircle, AlertTriangle, FileText, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const initialNotifications = [
  { id: 1, type: "completed", title: "Report Ready", message: "Your blood test results are now available.", time: "1 hour ago", read: false, icon: CheckCircle },
  { id: 2, type: "alert", title: "Critical Alert", message: "Your cholesterol levels require attention.", time: "2 hours ago", read: false, icon: AlertTriangle },
  { id: 3, type: "report", title: "Doctor Message", message: "Dr. Smith has added comments to your report.", time: "1 day ago", read: true, icon: FileText },
];

const typeStyles = { completed: "bg-success/10 text-success", alert: "bg-destructive/10 text-destructive", report: "bg-primary/10 text-primary" };

export default function PatientNotifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">Stay updated on your health reports</p>
        </div>
        {unreadCount > 0 && <Badge variant="destructive">{unreadCount} unread</Badge>}
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <Card key={n.id} className={!n.read ? "bg-primary/5" : ""}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-full ${typeStyles[n.type as keyof typeof typeStyles]}`}>
                  <n.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{n.title}</h3>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setNotifications(notifications.filter(x => x.id !== n.id))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
