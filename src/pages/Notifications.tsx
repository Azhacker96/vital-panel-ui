import { useState } from "react";
import { Bell, Send, AlertTriangle, Brain, Clock, Users, XCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const systemAlerts = [
  { id: 1, type: "extraction_failed", message: "OCR extraction failed for report #1284", time: "5 min ago", icon: XCircle, severity: "error" },
  { id: 2, type: "low_confidence", message: "Low AI confidence (72%) detected for report #1283", time: "12 min ago", icon: Brain, severity: "warning" },
  { id: 3, type: "critical_parameter", message: "Critical parameter detected: Creatinine 3.2 mg/dL", time: "25 min ago", icon: AlertTriangle, severity: "critical" },
  { id: 4, type: "review_delay", message: "Dr. Smith has 5 reports pending > 24 hours", time: "1 hour ago", icon: Clock, severity: "warning" },
  { id: 5, type: "duplicate_profile", message: "Potential duplicate patient profile detected", time: "2 hours ago", icon: Users, severity: "info" },
  { id: 6, type: "security", message: "Failed login attempt from IP 192.168.1.45", time: "3 hours ago", icon: Shield, severity: "error" },
];

const severityStyles = {
  critical: { bg: "bg-destructive/10", border: "border-destructive/30", icon: "text-destructive" },
  error: { bg: "bg-destructive/10", border: "border-destructive/30", icon: "text-destructive" },
  warning: { bg: "bg-warning/10", border: "border-warning/30", icon: "text-warning" },
  info: { bg: "bg-secondary/10", border: "border-secondary/30", icon: "text-secondary" },
};

export default function Notifications() {
  const [recipient, setRecipient] = useState<"doctors" | "patients">("doctors");
  const [message, setMessage] = useState("");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Notifications Center</h1>
        <p className="text-muted-foreground">Send notifications and view system alerts</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Send Notifications */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Send Notification</h2>
          <div className="rounded-lg border bg-card p-5 card-shadow">
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Recipients</p>
                <div className="flex gap-2">
                  <Button
                    variant={recipient === "doctors" ? "default" : "outline"}
                    onClick={() => setRecipient("doctors")}
                    className="flex-1"
                  >
                    Doctors
                  </Button>
                  <Button
                    variant={recipient === "patients" ? "default" : "outline"}
                    onClick={() => setRecipient("patients")}
                    className="flex-1"
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
                  rows={4}
                />
              </div>
              <Button className="w-full gap-2">
                <Send className="h-4 w-4" />
                Send Notification
              </Button>
            </div>
          </div>

          {/* Quick Templates */}
          <div className="rounded-lg border bg-card p-5 card-shadow">
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
                  className="w-full justify-start text-left"
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
            <h2 className="text-lg font-semibold text-foreground">System Alerts</h2>
            <Badge variant="secondary">{systemAlerts.length} alerts</Badge>
          </div>
          <div className="space-y-3">
            {systemAlerts.map((alert, index) => {
              const style = severityStyles[alert.severity as keyof typeof severityStyles];
              return (
                <div
                  key={alert.id}
                  className={cn(
                    "rounded-lg border p-4 card-shadow animate-slide-up",
                    style.bg,
                    style.border
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <alert.icon className={cn("h-5 w-5 mt-0.5", style.icon)} />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{alert.message}</p>
                      <p className="text-sm text-muted-foreground">{alert.time}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "capitalize border",
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
