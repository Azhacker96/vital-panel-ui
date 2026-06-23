import { useEffect, useState } from "react";
import { Upload, FileText, Filter, CheckCircle, Clock, XCircle, AlertTriangle, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const filters = [
  { label: "All", value: "all", icon: FileText },
  { label: "Completed", value: "completed", icon: CheckCircle },
  { label: "Pending", value: "uploaded", icon: Clock },
  { label: "Under Review", value: "under_review", icon: Brain },
  { label: "AI Done", value: "ai_done", icon: Brain },
  { label: "Critical", value: "critical", icon: AlertTriangle },
];

type Param = { name: string; value: string; unit?: string; status: string };
type Report = { id: string; patient: string; type: string; date: string; status: string; confidence: number; parameters: Param[] };

const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
  completed: { bg: "bg-success/10", text: "text-success", border: "border-success/30" },
  uploaded: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/30" },
  ocr: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/30" },
  ai_done: { bg: "bg-secondary/10", text: "text-secondary", border: "border-secondary/30" },
  under_review: { bg: "bg-secondary/10", text: "text-secondary", border: "border-secondary/30" },
  critical: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/30" },
};

const parameterStatusColors = {
  normal: "bg-success/10 text-success",
  low: "bg-warning/10 text-warning",
  high: "bg-warning/10 text-warning",
  critical: "bg-destructive/10 text-destructive",
  abnormal: "bg-destructive/10 text-destructive",
  borderline: "bg-warning/10 text-warning",
};

export default function ReportManagement() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isDragging, setIsDragging] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data: rows } = await supabase
      .from("reports")
      .select("id,title,created_at,status,ai_confidence,parameters,patient_id")
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
      status: r.status,
      confidence: Math.round((r.ai_confidence ?? 0) * 100),
      parameters: Array.isArray(r.parameters) ? (r.parameters as unknown as Param[]) : [],
    })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const approve = async (id: string) => {
    const { error } = await supabase.from("reports").update({ status: "completed" }).eq("id", id);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Report approved" }); load(); }
  };

  const filteredReports = reports.filter(
    (report) => selectedFilter === "all" || report.status === selectedFilter
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Report Management</h1>
        <p className="text-muted-foreground">Upload, view, and manage medical reports</p>
      </div>

      {/* Upload Area */}
      <div
        className={cn(
          "rounded-lg border-2 border-dashed p-8 text-center transition-all",
          isDragging ? "border-secondary bg-secondary/5" : "border-border bg-muted/30"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
      >
        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold text-foreground">Upload Medical Reports</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Drag and drop files here, or click to browse
        </p>
        <Button className="mt-4">
          Select Files
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          Supported formats: PDF, JPG, PNG • Max file size: 10MB
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Button
            key={filter.value}
            variant={selectedFilter === filter.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter(filter.value)}
            className="gap-2"
          >
            <filter.icon className="h-4 w-4" />
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Reports Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!loading && filteredReports.length === 0 && (
          <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">No reports found.</div>
        )}
        {filteredReports.map((report, index) => {
          const statusStyle = statusStyles[report.status] ?? statusStyles.uploaded;
          return (
            <div
              key={report.id}
              className="rounded-lg border bg-card p-5 card-shadow animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{report.patient}</h3>
                  <p className="text-sm text-muted-foreground">{report.type} • {report.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("border", statusStyle.bg, statusStyle.text, statusStyle.border)}>
                    {report.status}
                  </Badge>
                  <div className="flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                    <Brain className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium">{report.confidence}%</span>
                  </div>
                </div>
              </div>

              {/* AI Parameters */}
              {report.parameters.length > 0 && <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">AI Extracted Parameters</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {report.parameters.map((param) => (
                    <div
                      key={param.name}
                      className={cn(
                        "rounded-lg px-3 py-2",
                        parameterStatusColors[param.status as keyof typeof parameterStatusColors]
                      )}
                    >
                      <p className="text-xs font-medium opacity-80">{param.name}</p>
                      <p className="text-sm font-semibold">
                        {param.value} <span className="text-xs font-normal opacity-70">{param.unit}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>}

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button size="sm" className="flex-1" onClick={() => approve(report.id)} disabled={report.status === "completed"}>
                  Approve
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
