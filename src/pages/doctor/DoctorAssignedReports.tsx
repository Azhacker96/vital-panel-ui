import { useEffect, useState } from "react";
import { Search, Filter, Clock, CheckCircle, Eye, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type ReportRow = { id: string; patient: string; type: string; date: string; confidence: number; status: string; priority: string; aiSummary: string };

const statusFilters = [
  { label: "All", value: "all", icon: Filter },
  { label: "Pending", value: "pending", icon: Clock },
  { label: "Under Review", value: "under_review", icon: Eye },
  { label: "Completed", value: "completed", icon: CheckCircle },
];

const statusStyles: Record<string, string> = {
  pending: "bg-warning/20 text-warning",
  under_review: "bg-primary/20 text-primary",
  completed: "bg-success/20 text-success",
  uploaded: "bg-muted text-muted-foreground",
  ocr: "bg-muted text-muted-foreground",
  ai_done: "bg-primary/20 text-primary",
  critical: "bg-destructive/20 text-destructive",
};

const priorityStyles: Record<string, string> = {
  normal: "bg-muted text-muted-foreground",
  critical: "bg-destructive/20 text-destructive",
};

export default function DoctorAssignedReports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: assigns } = await supabase.from("report_assignments").select("report_id").eq("doctor_id", user.id);
      const ids = (assigns ?? []).map((a) => a.report_id);
      if (ids.length === 0) { setReports([]); setLoading(false); return; }
      const { data: rows } = await supabase
        .from("reports")
        .select("id,title,created_at,status,ai_confidence,ai_summary,is_critical,patient_id")
        .in("id", ids)
        .order("created_at", { ascending: false });
      const patientIds = Array.from(new Set((rows ?? []).map((r) => r.patient_id)));
      const { data: profiles } = patientIds.length
        ? await supabase.from("profiles").select("id,first_name,last_name").in("id", patientIds)
        : { data: [] as any[] };
      const nameMap = new Map((profiles ?? []).map((p: any) => [p.id, [p.first_name, p.last_name].filter(Boolean).join(" ") || "Patient"]));
      setReports((rows ?? []).map((r) => ({
        id: r.id,
        patient: nameMap.get(r.patient_id) ?? "Patient",
        type: r.title ?? "Report",
        date: new Date(r.created_at).toLocaleDateString(),
        confidence: Math.round((r.ai_confidence ?? 0) * 100),
        status: r.status,
        priority: r.is_critical ? "critical" : "normal",
        aiSummary: r.ai_summary ?? "No AI summary yet.",
      })));
      setLoading(false);
    })();
  }, [user]);

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || report.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Assigned Reports</h1>
        <p className="text-muted-foreground">Review and manage your assigned medical reports</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statusFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={selectedStatus === filter.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus(filter.value)}
              className="gap-2"
            >
              <filter.icon className="h-4 w-4" />
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!loading && filteredReports.length === 0 && (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No reports match your filters.</CardContent></Card>
        )}
        {filteredReports.map((report, index) => (
          <Card 
            key={report.id} 
            className={cn(
              "animate-slide-up hover:shadow-md transition-shadow cursor-pointer",
              report.priority === "critical" && "border-destructive/50"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{report.patient}</h3>
                    {report.priority === "critical" && (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{report.type}</p>
                  <p className="text-xs text-muted-foreground">{report.date}</p>
                </div>
                
                <div className="flex flex-col sm:items-end gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={priorityStyles[report.priority]}>
                      {report.priority}
                    </Badge>
                    <Badge className={statusStyles[report.status]}>
                      {report.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">AI Confidence:</span>
                    <span className={cn(
                      "font-semibold",
                      report.confidence >= 90 ? "text-success" : report.confidence >= 80 ? "text-warning" : "text-destructive"
                    )}>
                      {report.confidence}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">AI Summary:</span> {report.aiSummary}
                </p>
              </div>
              
              <div className="mt-4 flex gap-2">
                <Button size="sm" className="flex-1 sm:flex-none" onClick={() => navigate(`/doctor/review/${report.id}`)}>
                  Review Report
                </Button>
                <Button size="sm" variant="outline" className="flex-1 sm:flex-none" onClick={() => navigate(`/doctor/review/${report.id}`)}>
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
