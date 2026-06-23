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

  useEffect(() => {
    (async () => {
      const [{ data: reports }, { data: patients }, { count: dailyCount }] = await Promise.all([
        supabase.from("reports").select("status,is_critical,ai_confidence"),
        supabase.from("user_roles").select("user_id,role").eq("role", "patient"),
        supabase.from("reports").select("id", { count: "exact", head: true }).gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
      ]);
      const rs = reports ?? [];
      const conf = rs.filter((r) => r.ai_confidence != null).map((r) => r.ai_confidence as number);
      setData({
        total: rs.length,
        completed: rs.filter((r) => r.status === "completed").length,
        pending: rs.filter((r) => ["uploaded", "ocr", "ai_done", "under_review"].includes(r.status)).length,
        rejected: rs.filter((r) => r.status === "critical" && r.is_critical).length,
        totalPatients: (patients ?? []).length,
        activePatients: (patients ?? []).length,
        highRisk: rs.filter((r) => r.is_critical).length,
        avgConfidence: conf.length ? Math.round((conf.reduce((a, b) => a + b, 0) / conf.length) * 100) : 0,
        dailyProcessing: dailyCount ?? 0,
      });
    })();
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
            <AIAccuracyChart />
          </ChartCard>
          <ChartCard title="Reports per Doctor" subtitle="Current month breakdown">
            <ReportsPerDoctorChart />
          </ChartCard>
        </div>
        <div className="mt-4">
          <ChartCard title="Report Status Distribution" subtitle="Overall status breakdown">
            <ReportStatusChart />
          </ChartCard>
        </div>
      </section>
    </div>
  );
}
