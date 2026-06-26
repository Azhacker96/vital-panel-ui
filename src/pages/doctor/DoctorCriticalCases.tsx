import { AlertTriangle, Clock, User, ArrowUpRight, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

type Case = { id: string; patient: string; type: string; date: string; confidence: number; reason: string; severity: "critical" | "high"; timeElapsed: string };

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

const severityStyles = {
  critical: "bg-destructive text-destructive-foreground",
  high: "bg-warning text-warning-foreground",
  medium: "bg-primary text-primary-foreground",
};

export default function DoctorCriticalCases() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [criticalCases, setCases] = useState<Case[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: assigns } = await supabase.from("report_assignments").select("report_id").eq("doctor_id", user.id);
      const ids = (assigns ?? []).map((a) => a.report_id);
      if (ids.length === 0) return;
      const { data: rows } = await supabase
        .from("reports")
        .select("id,title,created_at,ai_confidence,ai_summary,is_critical,status,patient_id")
        .in("id", ids)
        .or("is_critical.eq.true,status.eq.critical")
        .order("created_at", { ascending: false });
      const patientIds = Array.from(new Set((rows ?? []).map((r) => r.patient_id)));
      const { data: profiles } = patientIds.length
        ? await supabase.from("profiles").select("id,first_name,last_name").in("id", patientIds)
        : { data: [] as any[] };
      const nameMap = new Map((profiles ?? []).map((p: any) => [p.id, [p.first_name, p.last_name].filter(Boolean).join(" ") || "Patient"]));
      setCases((rows ?? []).map((r) => ({
        id: r.id,
        patient: nameMap.get(r.patient_id) ?? "Patient",
        type: r.title ?? "Report",
        date: new Date(r.created_at).toLocaleDateString(),
        confidence: Math.round((r.ai_confidence ?? 0) * 100),
        reason: r.ai_summary ?? "Critical values detected",
        severity: r.status === "critical" ? "critical" : "high",
        timeElapsed: timeAgo(r.created_at),
      })));
    })();
  }, [user]);

  const critCount = criticalCases.filter((c) => c.severity === "critical").length;
  const highCount = criticalCases.filter((c) => c.severity === "high").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            Critical Cases
          </h1>
          <p className="text-muted-foreground">Cases requiring immediate attention</p>
        </div>
        <Badge variant="destructive" className="text-lg px-4 py-2">
          {criticalCases.length} Active Alerts
        </Badge>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-destructive/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-3xl font-bold text-destructive">{critCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-warning/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-3xl font-bold text-warning">{highCount}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
                <p className="text-3xl font-bold text-foreground">—</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Cases List */}
      <div className="space-y-4">
        {criticalCases.length === 0 && (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No critical cases.</CardContent></Card>
        )}
        {criticalCases.map((caseItem, index) => (
          <Card 
            key={caseItem.id} 
            className={`animate-slide-up border-l-4 ${
              caseItem.severity === "critical" ? "border-l-destructive" : "border-l-warning"
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge className={severityStyles[caseItem.severity as keyof typeof severityStyles]}>
                      {caseItem.severity.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{caseItem.timeElapsed}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold text-foreground">{caseItem.patient}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{caseItem.type}</span>
                  </div>
                  
                  <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">Alert:</span> {caseItem.reason}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>AI Confidence: </span>
                    <span className={`font-semibold ${caseItem.confidence < 85 ? "text-warning" : "text-foreground"}`}>
                      {caseItem.confidence}%
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button className="gap-2" onClick={() => navigate(`/doctor/review/${caseItem.id}`)}>
                    <ArrowUpRight className="h-4 w-4" />
                    Review Now
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => toast({ title: "Contact patient", description: "Opening patient profile…" }) || navigate(`/doctor/patients`)}>
                    <Phone className="h-4 w-4" />
                    Contact Patient
                  </Button>
                  <Button variant="outline" onClick={async () => {
                    await supabase.from("notifications").insert({ user_id: user!.id, type: "alert", title: "Case escalated", body: `Case for ${caseItem.patient} escalated to admin.` });
                    toast({ title: "Escalated to admin" });
                  }}>
                    Escalate to Admin
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
