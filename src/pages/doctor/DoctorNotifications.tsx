import { Bell, FileText, AlertTriangle, Clock, CheckCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

type Row = { id: string; type: string; title: string; body: string | null; read: boolean; created_at: string };

const typeStyles: Record<string, string> = {
  assignment: "bg-primary/10 text-primary",
  critical: "bg-destructive/10 text-destructive",
  deadline: "bg-warning/10 text-warning",
  completed: "bg-success/10 text-success",
  alert: "bg-destructive/10 text-destructive",
  report: "bg-primary/10 text-primary",
};
const typeIcons: Record<string, any> = {
  assignment: FileText, critical: AlertTriangle, deadline: Clock, completed: CheckCircle, alert: AlertTriangle, report: FileText,
};

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

export default function DoctorNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Row[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("notifications")
        .select("id,type,title,body,read,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setNotifications((data ?? []) as Row[]);
    })();
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((rows) => rows.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };
  const markAllAsRead = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    setNotifications((rows) => rows.map((n) => ({ ...n, read: true })));
  };
  const deleteNotification = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications((rows) => rows.filter((n) => n.id !== id));
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
        {notifications.map((notification, index) => {
          const Icon = typeIcons[notification.type] ?? Bell;
          return (
          <Card 
            key={notification.id}
            className={`animate-slide-up transition-all ${!notification.read ? "bg-primary/5 border-primary/20" : ""}`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-full ${typeStyles[notification.type] ?? "bg-muted text-muted-foreground"}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className={`font-semibold ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                        {notification.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{notification.body}</p>
                      <p className="text-xs text-muted-foreground mt-2">{timeAgo(notification.created_at)}</p>
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
        );})}
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
