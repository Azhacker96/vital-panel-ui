import { Bell, FileText, AlertTriangle, Clock, CheckCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const initialNotifications = [
  {
    id: 1,
    type: "assignment",
    title: "New Report Assigned",
    message: "A new X-Ray report for Emily Johnson has been assigned to you.",
    time: "5 minutes ago",
    read: false,
    icon: FileText,
  },
  {
    id: 2,
    type: "critical",
    title: "Critical Alert",
    message: "Sarah Wilson's ECG report shows irregular heart rhythm. Immediate review required.",
    time: "1 hour ago",
    read: false,
    icon: AlertTriangle,
  },
  {
    id: 3,
    type: "deadline",
    title: "Review Deadline Reminder",
    message: "3 reports are pending review and due within 24 hours.",
    time: "2 hours ago",
    read: false,
    icon: Clock,
  },
  {
    id: 4,
    type: "completed",
    title: "Report Approved",
    message: "Your review for John Anderson's blood test has been processed.",
    time: "1 day ago",
    read: true,
    icon: CheckCircle,
  },
  {
    id: 5,
    type: "assignment",
    title: "New Report Assigned",
    message: "MRI Scan report for Michael Davis requires your review.",
    time: "1 day ago",
    read: true,
    icon: FileText,
  },
];

const typeStyles = {
  assignment: "bg-primary/10 text-primary",
  critical: "bg-destructive/10 text-destructive",
  deadline: "bg-warning/10 text-warning",
  completed: "bg-success/10 text-success",
};

export default function DoctorNotifications() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Notifications
          </h1>
          <p className="text-muted-foreground">Stay updated with your reports and alerts</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} unread</Badge>
          )}
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((notification, index) => (
          <Card 
            key={notification.id}
            className={`animate-slide-up transition-all ${!notification.read ? "bg-primary/5 border-primary/20" : ""}`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-full ${typeStyles[notification.type as keyof typeof typeStyles]}`}>
                  <notification.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className={`font-semibold ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                        {notification.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!notification.read && (
                        <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                          Mark read
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {notifications.length === 0 && (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No notifications</p>
          </div>
        </Card>
      )}
    </div>
  );
}
