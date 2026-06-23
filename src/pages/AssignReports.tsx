import { useEffect, useState } from "react";
import { UserCheck, Shuffle, RotateCcw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

type Doctor = { id: string; name: string; specialty: string; pending: number; capacity: number; available: boolean };
type UR = { id: string; patient: string; type: string; priority: string };

export default function AssignReports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [unassignedReports, setUnassigned] = useState<UR[]>([]);

  const load = async () => {
    // Doctors
    const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "doctor");
    const docIds = (roles ?? []).map((r) => r.user_id);
    const { data: profiles } = docIds.length
      ? await supabase.from("profiles").select("id,first_name,last_name,status").in("id", docIds)
      : { data: [] as any[] };
    const { data: pendingAssigns } = await supabase.from("report_assignments").select("doctor_id,status").neq("status", "completed");
    const pendingMap = new Map<string, number>();
    (pendingAssigns ?? []).forEach((a) => pendingMap.set(a.doctor_id, (pendingMap.get(a.doctor_id) ?? 0) + 1));
    setDoctors((profiles ?? []).map((p: any) => ({
      id: p.id,
      name: `Dr. ${[p.first_name, p.last_name].filter(Boolean).join(" ") || "Unknown"}`,
      specialty: "General",
      pending: pendingMap.get(p.id) ?? 0,
      capacity: 20,
      available: p.status === "active",
    })));

    // Unassigned reports
    const { data: assigned } = await supabase.from("report_assignments").select("report_id");
    const assignedIds = new Set((assigned ?? []).map((a) => a.report_id));
    const { data: reports } = await supabase.from("reports").select("id,title,patient_id,is_critical,status").order("created_at", { ascending: false });
    const unassigned = (reports ?? []).filter((r) => !assignedIds.has(r.id));
    const patientIds = Array.from(new Set(unassigned.map((r) => r.patient_id)));
    const { data: pProfiles } = patientIds.length
      ? await supabase.from("profiles").select("id,first_name,last_name").in("id", patientIds)
      : { data: [] as any[] };
    const nameMap = new Map((pProfiles ?? []).map((p: any) => [p.id, [p.first_name, p.last_name].filter(Boolean).join(" ") || "Patient"]));
    setUnassigned(unassigned.map((r) => ({
      id: r.id,
      patient: nameMap.get(r.patient_id) ?? "Patient",
      type: r.title ?? "Report",
      priority: r.is_critical || r.status === "critical" ? "critical" : "medium",
    })));
  };

  useEffect(() => { load(); }, []);

  const assignToDoctor = async (doctorId: string) => {
    if (unassignedReports.length === 0) { toast({ title: "No unassigned reports" }); return; }
    const inserts = unassignedReports.map((r) => ({ report_id: r.id, doctor_id: doctorId, assigned_by: user?.id, status: "pending" as const }));
    const { error } = await supabase.from("report_assignments").insert(inserts);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else { toast({ title: `Assigned ${inserts.length} reports` }); load(); }
  };

  const autoAssignRoundRobin = async () => {
    const active = doctors.filter((d) => d.available);
    if (active.length === 0 || unassignedReports.length === 0) return;
    const inserts = unassignedReports.map((r, i) => ({ report_id: r.id, doctor_id: active[i % active.length].id, assigned_by: user?.id, status: "pending" as const }));
    const { error } = await supabase.from("report_assignments").insert(inserts);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else { toast({ title: `Auto-assigned ${inserts.length} reports` }); load(); }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assign Reports</h1>
          <p className="text-muted-foreground">Distribute reports to doctors for review</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={autoAssignRoundRobin}>
            <Shuffle className="h-4 w-4" />
            Round Robin
          </Button>
          <Button className="gap-2" onClick={autoAssignRoundRobin}>
            <UserCheck className="h-4 w-4" />
            Auto Assign
          </Button>
        </div>
      </div>

      {/* Unassigned Reports Alert */}
      {unassignedReports.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/10 p-4">
          <AlertCircle className="h-5 w-5 text-warning" />
          <div className="flex-1">
            <p className="font-medium text-foreground">{unassignedReports.length} Unassigned Reports</p>
            <p className="text-sm text-muted-foreground">Select a doctor below to assign pending reports</p>
          </div>
          <Button size="sm" variant="outline" onClick={autoAssignRoundRobin}>Auto Assign All</Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Doctor Load Cards */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Doctor Workload</h2>
          {doctors.length === 0 && <p className="text-sm text-muted-foreground">No doctors registered yet.</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            {doctors.map((doctor, index) => {
              const loadPercentage = (doctor.pending / doctor.capacity) * 100;
              const isOverloaded = loadPercentage > 80;
              return (
                <div
                  key={doctor.id}
                  onClick={() => setSelectedDoctor(doctor.id)}
                  className={cn(
                    "cursor-pointer rounded-lg border bg-card p-4 card-shadow transition-all hover:border-secondary animate-slide-up",
                    selectedDoctor === doctor.id && "border-secondary ring-2 ring-secondary/20",
                    !doctor.available && "opacity-60"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                        {doctor.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{doctor.name}</h3>
                        <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                      </div>
                    </div>
                    <Badge variant={doctor.available ? "default" : "secondary"}>
                      {doctor.available ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Pending Reports</span>
                      <span className={cn("font-medium", isOverloaded ? "text-destructive" : "text-foreground")}>
                        {doctor.pending} / {doctor.capacity}
                      </span>
                    </div>
                    <Progress 
                      value={loadPercentage} 
                      className={cn("h-2", isOverloaded && "[&>div]:bg-destructive")}
                    />
                  </div>
                  {doctor.available && (
                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 gap-1">
                        <RotateCcw className="h-3 w-3" />
                        Re-assign
                      </Button>
                      <Button size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); assignToDoctor(doctor.id); }}>
                        Assign
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Unassigned Reports List */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Pending Assignment</h2>
          <div className="space-y-3">
            {unassignedReports.length === 0 && <p className="text-sm text-muted-foreground">All caught up — no unassigned reports.</p>}
            {unassignedReports.map((report, index) => (
              <div
                key={report.id}
                className="rounded-lg border bg-card p-4 card-shadow animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">{report.patient}</h4>
                    <p className="text-sm text-muted-foreground">{report.type}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "border",
                      report.priority === "critical" && "bg-destructive/10 text-destructive border-destructive/30",
                      report.priority === "high" && "bg-warning/10 text-warning border-warning/30",
                      report.priority === "medium" && "bg-secondary/10 text-secondary border-secondary/30"
                    )}
                  >
                    {report.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
