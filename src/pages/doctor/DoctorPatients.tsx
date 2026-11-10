import { useEffect, useState } from "react";
import { Search, User, FileText, Download, Calendar, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

type PReport = { id: string; type: string; date: string; status: string; file_path: string; is_critical: boolean };
type PPatient = { id: string; name: string; email: string; phone: string; lastVisit: string; reports: PReport[]; history: string[] };

const statusColors: Record<string, string> = {
  uploaded: "bg-warning/20 text-warning",
  ocr: "bg-warning/20 text-warning",
  ai_done: "bg-primary/20 text-primary",
  under_review: "bg-primary/20 text-primary",
  completed: "bg-success/20 text-success",
  critical: "bg-destructive/20 text-destructive",
};

export default function DoctorPatients() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<PPatient[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: assigns } = await supabase.from("report_assignments").select("report_id").eq("doctor_id", user.id);
      const reportIds = (assigns ?? []).map((a) => a.report_id);
      if (!reportIds.length) { setLoading(false); return; }
      const { data: reports } = await supabase
        .from("reports")
        .select("id,title,created_at,status,patient_id,file_path,is_critical")
        .in("id", reportIds)
        .order("created_at", { ascending: false });
      const patientIds = [...new Set((reports ?? []).map((r) => r.patient_id))];
      const [{ data: profiles }, { data: history }] = await Promise.all([
        supabase.from("profiles").select("id,first_name,last_name,email,phone").in("id", patientIds),
        supabase.from("patient_medical_history").select("patient_id,summary").in("patient_id", patientIds).order("recorded_at", { ascending: false }),
      ]);
      const list: PPatient[] = (profiles ?? []).map((p) => {
        const rs = (reports ?? []).filter((r) => r.patient_id === p.id);
        return {
          id: p.id,
          name: [p.first_name, p.last_name].filter(Boolean).join(" ") || p.email || "Patient",
          email: p.email ?? "—",
          phone: p.phone ?? "—",
          lastVisit: rs[0] ? new Date(rs[0].created_at).toLocaleDateString() : "—",
          reports: rs.map((r) => ({ id: r.id, type: r.title ?? "Report", date: new Date(r.created_at).toLocaleDateString(), status: r.status, file_path: r.file_path, is_critical: r.is_critical })),
          history: (history ?? []).filter((h) => h.patient_id === p.id).map((h) => h.summary).slice(0, 5),
        };
      });
      setPatients(list);
      setLoading(false);
    })();
  }, [user]);

  const download = async (path: string) => {
    const { data, error } = await supabase.storage.from("medical-reports").createSignedUrl(path, 600);
    if (error || !data) { toast({ title: "Download failed", description: error?.message, variant: "destructive" }); return; }
    window.open(data.signedUrl, "_blank");
  };

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const selected = patients.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Patient Profiles</h1>
        <p className="text-muted-foreground">Patients with reports assigned to you</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search patients..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4 min-w-0">
          {loading && <p className="text-sm text-muted-foreground">Loading patients…</p>}
          {!loading && filtered.length === 0 && <p className="text-sm text-muted-foreground">No assigned patients yet.</p>}
          {filtered.map((p) => (
            <Card key={p.id} className={`cursor-pointer transition-all hover:shadow-md ${selectedId === p.id ? "ring-2 ring-primary" : ""}`} onClick={() => setSelectedId(p.id)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{p.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">Last: {p.lastVisit}</p>
                  </div>
                  <Badge variant="outline">{p.reports.length}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-2 min-w-0">
          {selected ? (
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" />Patient Information</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><p className="text-sm text-muted-foreground">Full Name</p><p className="font-medium">{selected.name}</p></div>
                    <div className="min-w-0"><p className="text-sm text-muted-foreground">Email</p><p className="font-medium break-all">{selected.email}</p></div>
                    <div><p className="text-sm text-muted-foreground">Phone</p><p className="font-medium">{selected.phone}</p></div>
                    <div><p className="text-sm text-muted-foreground">Total Reports</p><p className="font-medium">{selected.reports.length}</p></div>
                    {selected.history.length > 0 && (
                      <div className="sm:col-span-2">
                        <p className="text-sm text-muted-foreground mb-2">Medical History</p>
                        <ul className="list-disc pl-5 space-y-1 text-sm">{selected.history.map((h, i) => <li key={i}>{h}</li>)}</ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" />Reports</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {selected.reports.map((r) => (
                    <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{r.type}</p>
                          <p className="text-sm text-muted-foreground">{r.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={statusColors[r.status] ?? ""}>{r.status.replace("_", " ")}</Badge>
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => navigate(`/doctor/review/${r.id}`)}><Eye className="h-3 w-3" />Review</Button>
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => download(r.file_path)}><Download className="h-3 w-3" />File</Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="h-64 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Select a patient to view details</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
