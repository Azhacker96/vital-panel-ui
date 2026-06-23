import { useEffect, useState } from "react";
import { Search, Download, Merge, FileCheck, Trash2, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

type ReportEntry = { id: string; type: string; date: string; status: string };
type Patient = { id: string; name: string; age: number | string; gender: string; reports: ReportEntry[] };

export default function PatientHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "patient");
      const ids = (roles ?? []).map((r) => r.user_id);
      if (ids.length === 0) { setLoading(false); return; }
      const [{ data: profiles }, { data: reports }] = await Promise.all([
        supabase.from("profiles").select("id,first_name,last_name").in("id", ids),
        supabase.from("reports").select("id,title,created_at,status,patient_id").in("patient_id", ids).order("created_at", { ascending: false }),
      ]);
      const byPatient = new Map<string, ReportEntry[]>();
      (reports ?? []).forEach((r) => {
        const arr = byPatient.get(r.patient_id) ?? [];
        arr.push({ id: r.id, type: r.title ?? "Report", date: new Date(r.created_at).toLocaleDateString(), status: r.status });
        byPatient.set(r.patient_id, arr);
      });
      setPatients((profiles ?? []).map((p: any) => ({
        id: p.id,
        name: [p.first_name, p.last_name].filter(Boolean).join(" ") || "Patient",
        age: "—",
        gender: "—",
        reports: byPatient.get(p.id) ?? [],
      })));
      setLoading(false);
    })();
  }, []);

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedPatientData = patients.find((p) => p.id === selectedPatient);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Patient Medical History</h1>
          <p className="text-muted-foreground">View and manage patient records</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Merge className="h-4 w-4" />
            Merge Duplicates
          </Button>
          <Button variant="outline" className="gap-2">
            <FileCheck className="h-4 w-4" />
            Validate Files
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search patients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Patient List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Patients</h2>
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!loading && filteredPatients.length === 0 && <p className="text-sm text-muted-foreground">No patients found.</p>}
          {filteredPatients.map((patient, index) => (
            <div
              key={patient.id}
              onClick={() => setSelectedPatient(patient.id)}
              className={cn(
                "cursor-pointer rounded-lg border bg-card p-4 card-shadow transition-all hover:border-secondary animate-slide-up",
                selectedPatient === patient.id && "border-secondary ring-2 ring-secondary/20"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                  {patient.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{patient.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {patient.age} yrs • {patient.gender}
                  </p>
                </div>
                <Badge variant="secondary">{patient.reports.length} reports</Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Report Details */}
        <div className="lg:col-span-2">
          {selectedPatientData ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  {selectedPatientData.name}'s Reports
                </h2>
                <Button className="gap-2">
                  <Download className="h-4 w-4" />
                  Download All (PDF)
                </Button>
              </div>
              <div className="space-y-3">
                {selectedPatientData.reports.map((report, index) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between rounded-lg border bg-card p-4 card-shadow animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-muted p-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{report.type}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {report.date}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "border",
                          report.status === "completed"
                            ? "bg-success/10 text-success border-success/30"
                            : "bg-warning/10 text-warning border-warning/30"
                        )}
                      >
                        {report.status}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed bg-muted/30 p-12">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">Select a Patient</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Choose a patient from the list to view their medical history
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
