import { useEffect, useState } from "react";
import { Bell, Send, AlertTriangle, Brain, Clock, Users, XCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const severityStyles = {
  critical: { bg: "bg-destructive/10", border: "border-destructive/30", icon: "text-destructive" },
  error: { bg: "bg-destructive/10", border: "border-destructive/30", icon: "text-destructive" },
  warning: { bg: "bg-warning/10", border: "border-warning/30", icon: "text-warning" },
  info: { bg: "bg-secondary/10", border: "border-secondary/30", icon: "text-secondary" },
};

type Alert = { id: string; message: string; time: string; icon: any; severity: keyof typeof severityStyles };

function iconForLevel(level: string) {
  if (level === "error") return XCircle;
  if (level === "warning") return Clock;
  if (level === "critical") return AlertTriangle;
  return Bell;
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} d ago`;
}

export default function Notifications() {
  const [recipient, setRecipient] = useState<"doctors" | "patients">("doctors");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [systemAlerts, setAlerts] = useState<Alert[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("activity_logs")
        .select("id,action,metadata,created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      setAlerts((data ?? []).map((r) => {
        const meta = (r.metadata ?? {}) as { level?: string };
        const level = (meta.level as keyof typeof severityStyles) ?? "info";
        return { id: r.id, message: r.action, time: timeAgo(r.created_at), icon: iconForLevel(level), severity: level };
      }));
    })();
  }, []);

  const sendNotification = async () => {
    if (!message.trim()) { toast({ title: "Message required", variant: "destructive" }); return; }
    setSending(true);
    const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", recipient === "doctors" ? "doctor" : "patient");
    const ids = (roles ?? []).map((r) => r.user_id);
    if (ids.length === 0) { toast({ title: "No recipients found", variant: "destructive" }); setSending(false); return; }
    const inserts = ids.map((uid) => ({ user_id: uid, type: "alert", title: "Notification from Admin", body: message }));
    const { error } = await supabase.from("notifications").insert(inserts);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else { toast({ title: `Sent to ${ids.length} ${recipient}` }); setMessage(""); }
    setSending(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Notifications Center</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Send notifications and view system alerts</p>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Send Notifications */}
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-semibold text-foreground">Send Notification</h2>
          <div className="rounded-lg border bg-card p-4 sm:p-5 card-shadow">
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Recipients</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={recipient === "doctors" ? "default" : "outline"}
                    onClick={() => setRecipient("doctors")}
                    size="sm"
                    className="w-full sm:text-sm"
                  >
                    Doctors
                  </Button>
                  <Button
                    variant={recipient === "patients" ? "default" : "outline"}
                    onClick={() => setRecipient("patients")}
                    size="sm"
                    className="w-full sm:text-sm"
                  >
                    Patients
                  </Button>
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Message</p>
                <Textarea
                  placeholder="Type your notification message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="text-sm"
                />
              </div>
              <Button className="w-full gap-2" size="sm" onClick={sendNotification} disabled={sending}>
                <Send className="h-4 w-4" />
                {sending ? "Sending…" : "Send Notification"}
              </Button>
            </div>
          </div>

          {/* Quick Templates */}
          <div className="rounded-lg border bg-card p-4 sm:p-5 card-shadow">
            <p className="mb-3 text-sm font-medium text-foreground">Quick Templates</p>
            <div className="space-y-2">
              {[
                "Your report is ready for review",
                "New reports have been assigned to you",
                "Please update your profile information",
                "Scheduled maintenance: System will be unavailable",
              ].map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left h-auto py-2 text-xs sm:text-sm whitespace-normal"
                  onClick={() => setMessage(template)}
                >
                  {template}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* System Alerts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">System Alerts</h2>
            <Badge variant="secondary" className="text-xs">{systemAlerts.length} alerts</Badge>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {systemAlerts.length === 0 && <p className="text-sm text-muted-foreground">No recent alerts.</p>}
            {systemAlerts.map((alert, index) => {
              const style = severityStyles[alert.severity as keyof typeof severityStyles];
              return (
                <div
                  key={alert.id}
                  className={cn(
                    "rounded-lg border p-3 sm:p-4 card-shadow animate-slide-up",
                    style.bg,
                    style.border
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <alert.icon className={cn("h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0", style.icon)} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm sm:text-base leading-tight">{alert.message}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">{alert.time}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "capitalize border text-[10px] sm:text-xs flex-shrink-0",
                        alert.severity === "critical" && "bg-destructive/20 text-destructive border-destructive/30",
                        alert.severity === "error" && "bg-destructive/20 text-destructive border-destructive/30",
                        alert.severity === "warning" && "bg-warning/20 text-warning border-warning/30",
                        alert.severity === "info" && "bg-secondary/20 text-secondary border-secondary/30"
                      )}
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
