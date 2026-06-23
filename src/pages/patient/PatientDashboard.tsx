import { FileText, Clock, AlertTriangle, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function PatientDashboard() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ total: 0, review: 0, critical: 0, completed: 0 });
  const [latest, setLatest] = useState<{ ai_summary: string | null; is_critical: boolean | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("reports")
        .select("status,is_critical,ai_summary,created_at")
        .eq("patient_id", user.id)
        .order("created_at", { ascending: false });
      const rows = data ?? [];
      setCounts({
        total: rows.length,
        review: rows.filter((r) => r.status === "uploaded" || r.status === "ocr" || r.status === "ai_done" || r.status === "under_review").length,
        critical: rows.filter((r) => r.is_critical).length,
        completed: rows.filter((r) => r.status === "completed").length,
      });
      setLatest(rows[0] ?? null);
      setLoading(false);
    })();
  }, [user]);

  const healthScore = counts.total === 0 ? "—" : `${Math.max(0, 100 - counts.critical * 20)}%`;
  const stats = [
    { label: "Total Reports", value: String(counts.total), icon: FileText, color: "text-primary" },
    { label: "Under Review", value: String(counts.review), icon: Clock, color: "text-warning" },
    { label: "Critical Alerts", value: String(counts.critical), icon: AlertTriangle, color: "text-destructive" },
    { label: "Health Score", value: healthScore, icon: Activity, color: "text-success" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground">Your health overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={stat.label} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-muted/50 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold mb-4">Latest Health Summary</h3>
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Loading…"
              : latest?.ai_summary
                ? latest.ai_summary
                : "No reports yet. Upload a report to see your health insights."}
          </p>
          {latest && (
            <Badge className={`mt-3 ${latest.is_critical ? "bg-destructive/20 text-destructive" : "bg-success/20 text-success"}`}>
              {latest.is_critical ? "Needs Attention" : "Good Health"}
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
