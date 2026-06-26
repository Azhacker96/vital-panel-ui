import { useEffect, useRef, useState } from "react";
import { Upload, FileText, CheckCircle, Clock, AlertTriangle, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

const filters = [
  { label: "All", value: "all", icon: FileText },
  { label: "Completed", value: "completed", icon: CheckCircle },
  { label: "Pending", value: "uploaded", icon: Clock },
  { label: "Under Review", value: "under_review", icon: Brain },
  { label: "AI Done", value: "ai_done", icon: Brain },
  { label: "Critical", value: "critical", icon: AlertTriangle },
];

type Param = { name: string; value: string; unit?: string; range?: string; status: string };
type Param = { name: string; value: string; unit?: string; range?: string; status: string; raw_text?: string; confidence?: number; flagged?: boolean };
type Report = { id: string; patient: string; type: string; date: string; status: string; confidence: number; parameters: Param[]; summary?: string | null; file_path?: string; ocr_text?: string | null };

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
  const [patients, setPatients] = useState<{ id: string; name: string }[]>([]);
  const [uploadPatient, setUploadPatient] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [viewing, setViewing] = useState<Report | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const load = async () => {
    setLoading(true);
    const { data: rows } = await supabase
      .from("reports")
      .select("id,title,created_at,status,ai_confidence,parameters,patient_id,ai_summary,file_path,ocr_text")
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
      summary: r.ai_summary,
      file_path: r.file_path,
      ocr_text: (r as any).ocr_text ?? null,
    })));
    setLoading(false);
  };

  const loadPatients = async () => {
    const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "patient");
    const ids = (roles ?? []).map((r) => r.user_id);
    if (!ids.length) return setPatients([]);
    const { data: profs } = await supabase.from("profiles").select("id,first_name,last_name").in("id", ids);
    setPatients((profs ?? []).map((p: any) => ({ id: p.id, name: [p.first_name, p.last_name].filter(Boolean).join(" ") || "Patient" })));
  };

  useEffect(() => { load(); loadPatients(); }, []);

  const handleFiles = async (file: File | null) => {
    if (!file || !user) return;
    if (!uploadPatient) { toast({ title: "Select a patient first", variant: "destructive" }); return; }
    const ALLOWED = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!ALLOWED.includes(file.type)) { toast({ title: "Unsupported file", description: "PDF, JPG, or PNG only.", variant: "destructive" }); return; }
    if (file.size > 10 * 1024 * 1024) { toast({ title: "File too large", description: "Max 10MB.", variant: "destructive" }); return; }
    setBusy(true);
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${uploadPatient}/${Date.now()}-${safe}`;
    const { error: upErr } = await supabase.storage.from('medical-reports').upload(path, file, { contentType: file.type });
    if (upErr) { setBusy(false); toast({ title: "Upload failed", description: upErr.message, variant: "destructive" }); return; }
    const { data: inserted, error: insErr } = await supabase.from('reports').insert({
      patient_id: uploadPatient, uploaded_by: user.id, title: file.name, file_path: path, file_type: file.type, status: 'uploaded',
    }).select('id').single();
    if (insErr) { setBusy(false); toast({ title: "Saving failed", description: insErr.message, variant: "destructive" }); return; }
    supabase.functions.invoke('analyze-report', { body: { report_id: inserted.id } }).catch(() => {});
    toast({ title: "Uploaded", description: "AI analysis started." });
    setBusy(false);
    load();
  };

  const viewFile = async (r: Report) => {
    if (!r.file_path) return;
    const { data, error } = await supabase.storage.from('medical-reports').createSignedUrl(r.file_path, 300);
    if (error || !data) { toast({ title: "Could not open file", description: error?.message, variant: "destructive" }); return; }
    window.open(data.signedUrl, '_blank');
  };

  const approve = async (id: string) => {
    const { error } = await supabase.from("reports").update({ status: "completed" }).eq("id", id);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Report approved" }); load(); }
  };

  const reanalyze = async (id: string) => {
    setBusy(true);
    toast({ title: "Re-analyzing…", description: "AI is reading the file again." });
    const { error } = await supabase.functions.invoke("analyze-report", { body: { report_id: id } });
    setBusy(false);
    if (error) { toast({ title: "Re-analyze failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Analysis updated" });
    await load();
    const fresh = (await supabase.from("reports").select("id,title,created_at,status,ai_confidence,parameters,ai_summary,file_path,ocr_text,patient_id").eq("id", id).maybeSingle()).data;
    if (fresh && viewing) {
      setViewing({ ...viewing, status: fresh.status, confidence: Math.round((fresh.ai_confidence ?? 0) * 100), parameters: Array.isArray(fresh.parameters) ? (fresh.parameters as unknown as Param[]) : [], summary: fresh.ai_summary, ocr_text: fresh.ocr_text });
    }
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
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <label className="text-sm font-medium">Upload for patient:</label>
          <Select value={uploadPatient} onValueChange={setUploadPatient}>
            <SelectTrigger className="w-full sm:w-72"><SelectValue placeholder="Select a patient" /></SelectTrigger>
            <SelectContent>
              {patients.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="application/pdf,image/png,image/jpeg"
          onChange={(e) => { handleFiles(e.target.files?.[0] ?? null); e.target.value = ""; }}
        />
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
          handleFiles(e.dataTransfer.files?.[0] ?? null);
        }}
      >
        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold text-foreground">Upload Medical Reports</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Drag and drop files here, or click to browse
        </p>
        <Button className="mt-4" onClick={() => inputRef.current?.click()} disabled={busy || !uploadPatient}>
          {busy ? "Uploading…" : "Select Files"}
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          Supported formats: PDF, JPG, PNG • Max file size: 10MB
        </p>
        </div>
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
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{report.patient}</h3>
                  <p className="text-sm text-muted-foreground break-words">{report.type} • {report.date}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
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
                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {report.parameters.map((param) => (
                    <div
                      key={param.name}
                      className={cn(
                        "rounded-lg px-3 py-2 min-w-0",
                        parameterStatusColors[param.status as keyof typeof parameterStatusColors]
                      )}
                    >
                      <p className="text-xs font-medium opacity-80 truncate">{param.name}</p>
                      <p className="text-sm font-semibold break-words">
                        {param.value} <span className="text-xs font-normal opacity-70">{param.unit}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>}

              {/* Actions */}
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setViewing(report)}>
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

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[calc(100vw-2rem)] sm:w-full">
          <DialogHeader>
            <DialogTitle className="break-words">{viewing?.type}</DialogTitle>
            <DialogDescription>{viewing?.patient} • {viewing?.date} • Status: {viewing?.status}</DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className="space-y-4">
              {viewing.summary && (
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground mb-1">AI Summary</p>
                  <p className="text-sm">{viewing.summary}</p>
                  <p className="text-xs text-muted-foreground mt-1">Overall confidence: <span className={cn("font-semibold", viewing.confidence < 70 ? "text-destructive" : viewing.confidence < 85 ? "text-warning" : "text-success")}>{viewing.confidence}%</span></p>
                </div>
              )}
              {viewing.parameters.length > 0 && (
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground mb-2">Parameters</p>
                  <div className="grid grid-cols-1 gap-2">
                    {viewing.parameters.map((p) => (
                      <div key={p.name} className={cn("rounded border p-3 text-sm space-y-1", p.flagged && "border-warning bg-warning/5")}>
                        <div className="flex flex-wrap justify-between gap-2">
                          <span className="font-medium break-words">{p.name}</span>
                          <span className="break-words text-right">
                            {p.value} <span className="text-xs text-muted-foreground">({p.range || "—"}) · {p.status}</span>
                          </span>
                        </div>
                        {p.flagged && (
                          <p className="text-xs text-warning">⚠ Low-confidence{typeof p.confidence === "number" ? ` (${Math.round(p.confidence * 100)}%)` : ""} — verify against source.</p>
                        )}
                        {p.raw_text && (
                          <p className="text-xs text-muted-foreground break-words"><span className="font-medium">Raw:</span> "{p.raw_text}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {viewing.ocr_text && (
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground mb-1">Raw OCR Text</p>
                  <pre className="text-xs bg-muted/40 rounded p-3 whitespace-pre-wrap break-words max-h-48 overflow-auto">{viewing.ocr_text}</pre>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" className="flex-1" onClick={() => viewing && viewFile(viewing)}>
                  <FileText className="h-4 w-4 mr-2" /> Open original file
                </Button>
                <Button className="flex-1" disabled={busy} onClick={() => viewing && reanalyze(viewing.id)}>
                  <Brain className="h-4 w-4 mr-2" /> {busy ? "Re-analyzing…" : "Re-analyze"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
