import { useEffect, useState } from "react";
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Users, 
  UserCheck, 
  AlertTriangle,
  Brain,
  Target,
  TrendingUp
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { ChartCard, AIAccuracyChart, ReportsPerDoctorChart, ReportStatusChart } from "@/components/dashboard/ChartCard";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const [data, setData] = useState({
    total: 0, completed: 0, pending: 0, rejected: 0,
    totalPatients: 0, activePatients: 0, highRisk: 0,
    avgConfidence: 0, dailyProcessing: 0,
  });
  const [accuracyData, setAccuracyData] = useState<{ name: string; value: number }[]>([]);
  const [doctorData, setDoctorData] = useState<{ name: string; reports: number }[]>([]);
  const [statusData, setStatusData] = useState<{ name: string; value: number; color: string }[]>([]);

  useEffect(() => {
    const load = async () => {
      const [{ data: reports }, { data: patients }, { count: dailyCount }] = await Promise.all([
        supabase.from("reports").select("status,is_critical,ai_confidence"),
        supabase.from("user_roles").select("user_id,role").eq("role", "patient"),
        supabase.from("reports").select("id", { count: "exact", head: true }).gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
      ]);
      const rs = reports ?? [];
      const conf = rs.filter((r) => r.ai_confidence != null).map((r) => r.ai_confidence as number);
      const completed = rs.filter((r) => r.status === "completed").length;
      const pending = rs.filter((r) => ["uploaded", "ocr", "ai_done", "under_review"].includes(r.status)).length;
      const critical = rs.filter((r) => r.is_critical).length;
      setData({
        total: rs.length,
        completed,
        pending,
        rejected: rs.filter((r) => r.status === "critical" && r.is_critical).length,
        totalPatients: (patients ?? []).length,
        activePatients: (patients ?? []).length,
        highRisk: critical,
        avgConfidence: conf.length ? Math.round((conf.reduce((a, b) => a + b, 0) / conf.length) * 100) : 0,
        dailyProcessing: dailyCount ?? 0,
      });
      setStatusData([
        { name: "Completed", value: completed, color: "hsl(145, 63%, 42%)" },
        { name: "Pending", value: pending, color: "hsl(36, 100%, 50%)" },
        { name: "Critical", value: critical, color: "hsl(4, 78%, 57%)" },
      ]);

      // Accuracy trend: last 7 days from analyze_history
      const since = new Date(); since.setDate(since.getDate() - 6); since.setHours(0, 0, 0, 0);
      const { data: history } = await supabase
        .from("analyze_history")
        .select("confidence,created_at")
        .gte("created_at", since.toISOString());
      const days: { name: string; value: number }[] = [];
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      for (let i = 0; i < 7; i++) {
        const d = new Date(since); d.setDate(since.getDate() + i);
        const key = d.toDateString();
        const rows = (history ?? []).filter((h) => new Date(h.created_at).toDateString() === key && h.confidence != null);
        const avg = rows.length ? Math.round((rows.reduce((a, b) => a + (b.confidence as number), 0) / rows.length) * 100) : 0;
        days.push({ name: dayNames[d.getDay()], value: avg });
      }
      setAccuracyData(days);

      // Reports per doctor
      const { data: assigns } = await supabase.from("report_assignments").select("doctor_id");
      const counts = new Map<string, number>();
      (assigns ?? []).forEach((a) => counts.set(a.doctor_id, (counts.get(a.doctor_id) ?? 0) + 1));
      const doctorIds = Array.from(counts.keys());
      const { data: docProfiles } = doctorIds.length
        ? await supabase.from("profiles").select("id,first_name,last_name").in("id", doctorIds)
        : { data: [] as any[] };
      const nameMap = new Map((docProfiles ?? []).map((p: any) => [p.id, [p.first_name, p.last_name].filter(Boolean).join(" ") || "Doctor"]));
      setDoctorData(
        Array.from(counts.entries())
          .map(([id, n]) => ({ name: nameMap.get(id) ?? "Doctor", reports: n }))
          .sort((a, b) => b.reports - a.reports)
          .slice(0, 8)
      );
    };
    load();

    const channel = supabase
      .channel("dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "reports" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "analyze_history" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "report_assignments" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your medical reports and analytics</p>
      </div>

      {/* Report Statistics */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Report Statistics</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Reports" value={String(data.total)} icon={FileText} />
          <StatCard title="Completed Reports" value={String(data.completed)} icon={CheckCircle} variant="success" />
          <StatCard title="Pending Reports" value={String(data.pending)} icon={Clock} variant="warning" />
          <StatCard title="Critical Reports" value={String(data.rejected)} icon={XCircle} variant="destructive" />
        </div>
      </section>

      {/* Patient Statistics */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Patient Statistics</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Total Patients" value={String(data.totalPatients)} icon={Users} />
          <StatCard title="Active Patients" value={String(data.activePatients)} icon={UserCheck} variant="secondary" />
          <StatCard title="High-Risk Reports" value={String(data.highRisk)} icon={AlertTriangle} variant="destructive" />
        </div>
      </section>

      {/* AI & System Analytics */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">AI & System Analytics</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard title="AI Accuracy" value={data.avgConfidence ? `${data.avgConfidence}%` : "—"} icon={Brain} variant="success" />
          <StatCard title="Confidence Score" value={data.avgConfidence ? `${data.avgConfidence}%` : "—"} icon={Target} variant="secondary" />
          <StatCard title="Daily Processing" value={String(data.dailyProcessing)} icon={TrendingUp} />
        </div>
      </section>

      {/* Charts Section */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Analytics Charts</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="AI Accuracy Trend" subtitle="Last 7 days performance">
            <AIAccuracyChart data={accuracyData} />
          </ChartCard>
          <ChartCard title="Reports per Doctor" subtitle="Assignments breakdown">
            <ReportsPerDoctorChart data={doctorData} />
          </ChartCard>
        </div>
        <div className="mt-4">
          <ChartCard title="Report Status Distribution" subtitle="Overall status breakdown">
            <ReportStatusChart data={statusData} />
          </ChartCard>
        </div>
      </section>
    </div>
  );
}
