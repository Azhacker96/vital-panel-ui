import { Bell, CheckCircle, AlertTriangle, FileText, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

type Row = { id: string; type: string; title: string; body: string | null; read: boolean; created_at: string };

const typeStyles: Record<string, string> = {
  completed: "bg-success/10 text-success",
  alert: "bg-destructive/10 text-destructive",
  critical: "bg-destructive/10 text-destructive",
  report: "bg-primary/10 text-primary",
  assignment: "bg-primary/10 text-primary",
};
const typeIcons: Record<string, any> = {
  completed: CheckCircle, alert: AlertTriangle, critical: AlertTriangle, report: FileText, assignment: FileText,
};

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} d ago`;
}

export default function PatientNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("notifications")
        .select("id,type,title,body,read,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setNotifications((data ?? []) as Row[]);
      setLoading(false);
    })();
  }, [user]);

  const remove = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications((n) => n.filter((x) => x.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

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
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!loading && notifications.length === 0 && (
          <Card><CardContent className="p-8 text-center text-muted-foreground"><Bell className="h-10 w-10 mx-auto mb-2 opacity-50" />No notifications.</CardContent></Card>
        )}
        {notifications.map((n) => {
          const Icon = typeIcons[n.type] ?? Bell;
          return (
            <Card key={n.id} className={!n.read ? "bg-primary/5" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full ${typeStyles[n.type] ?? "bg-muted text-muted-foreground"}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{n.title}</h3>
                    <p className="text-sm text-muted-foreground">{n.body}</p>
                    <p className="text-xs text-muted-foreground mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => remove(n.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
