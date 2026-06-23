import { FileText, Clock, AlertTriangle, TrendingUp, Activity, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const priorityColors: Record<string, string> = {
  normal: "bg-success/20 text-success border-success/30",
  critical: "bg-destructive/20 text-destructive border-destructive/30",
};

const statusColors: Record<string, string> = {
  pending: "bg-warning/20 text-warning",
  under_review: "bg-primary/20 text-primary",
  completed: "bg-success/20 text-success",
  uploaded: "bg-muted text-muted-foreground",
  ocr: "bg-muted text-muted-foreground",
  ai_done: "bg-primary/20 text-primary",
  critical: "bg-destructive/20 text-destructive",
};

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ assigned: 0, pending: 0, critical: 0, completedToday: 0 });
  const [recentReports, setRecentReports] = useState<{ id: string; patient: string; type: string; confidence: number; status: string; priority: string }[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: assigns } = await supabase
        .from("report_assignments")
        .select("report_id,status")
        .eq("doctor_id", user.id);
      const reportIds = (assigns ?? []).map((a) => a.report_id);
      if (reportIds.length === 0) { setStats({ assigned: 0, pending: 0, critical: 0, completedToday: 0 }); return; }
      const { data: reports } = await supabase
        .from("reports")
        .select("id,title,status,is_critical,ai_confidence,patient_id,updated_at,created_at")
        .in("id", reportIds)
        .order("created_at", { ascending: false });
      const rows = reports ?? [];
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      setStats({
        assigned: rows.length,
        pending: rows.filter((r) => r.status !== "completed").length,
        critical: rows.filter((r) => r.is_critical || r.status === "critical").length,
        completedToday: rows.filter((r) => r.status === "completed" && new Date(r.updated_at) >= todayStart).length,
      });
      const patientIds = Array.from(new Set(rows.map((r) => r.patient_id)));
      const { data: profiles } = patientIds.length
        ? await supabase.from("profiles").select("id,first_name,last_name").in("id", patientIds)
        : { data: [] as any[] };
      const nameMap = new Map((profiles ?? []).map((p: any) => [p.id, [p.first_name, p.last_name].filter(Boolean).join(" ") || "Patient"]));
      setRecentReports(rows.slice(0, 4).map((r) => ({
        id: r.id,
        patient: nameMap.get(r.patient_id) ?? "Patient",
        type: r.title ?? "Report",
        confidence: Math.round((r.ai_confidence ?? 0) * 100),
        status: r.status,
        priority: r.is_critical ? "critical" : "normal",
      })));
    })();
  }, [user]);

  const statCards = [
    { label: "Assigned Reports", value: String(stats.assigned), icon: FileText, change: "", color: "text-primary" },
    { label: "Pending Review", value: String(stats.pending), icon: Clock, change: "", color: "text-warning" },
    { label: "Critical Cases", value: String(stats.critical), icon: AlertTriangle, change: "Needs attention", color: "text-destructive" },
    { label: "Completed Today", value: String(stats.completedToday), icon: CheckCircle, change: "", color: "text-success" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.name}</h1>
        <p className="text-muted-foreground">Here's your daily overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={stat.label} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-full bg-muted/50 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance & Recent Reports */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Performance Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Your Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg. Review Time</span>
              <span className="font-semibold">12 min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Accuracy Score</span>
              <span className="font-semibold text-success">98.5%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Reports This Week</span>
              <span className="font-semibold">47</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Performance Score</span>
              <Badge className="bg-success/20 text-success">Excellent</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Recent Assigned Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentReports.length === 0 && <p className="text-sm text-muted-foreground">No assigned reports yet.</p>}
            {recentReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-medium text-foreground">{report.patient}</p>
                  <p className="text-sm text-muted-foreground">{report.type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={priorityColors[report.priority]}>
                    {report.priority}
                  </Badge>
                  <Badge className={statusColors[report.status]}>
                    {report.confidence}%
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* AI Confidence Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-warning" />
            AI Confidence Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <div>
                  <p className="font-medium">Low confidence detected</p>
                  <p className="text-sm text-muted-foreground">Patient: Sarah Wilson - ECG Report (78%)</p>
                </div>
              </div>
              <Badge variant="outline" className="border-warning text-warning">Review Required</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="font-medium">Critical values found</p>
                  <p className="text-sm text-muted-foreground">Patient: Emily Johnson - Abnormal readings detected</p>
                </div>
              </div>
              <Badge variant="outline" className="border-destructive text-destructive">Urgent</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
