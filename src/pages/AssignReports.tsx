import { useState } from "react";
import { UserCheck, Shuffle, RotateCcw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const doctors = [
  { id: 1, name: "Dr. Sarah Smith", specialty: "Cardiology", pending: 12, capacity: 20, available: true },
  { id: 2, name: "Dr. Michael Brown", specialty: "Nephrology", pending: 18, capacity: 20, available: true },
  { id: 3, name: "Dr. Emily Johnson", specialty: "Endocrinology", pending: 8, capacity: 15, available: true },
  { id: 4, name: "Dr. Robert Wilson", specialty: "Hematology", pending: 5, capacity: 15, available: false },
  { id: 5, name: "Dr. Lisa Davis", specialty: "Pulmonology", pending: 14, capacity: 18, available: true },
  { id: 6, name: "Dr. James Taylor", specialty: "Gastroenterology", pending: 10, capacity: 20, available: true },
];

const unassignedReports = [
  { id: 1, patient: "John Doe", type: "Blood Test", priority: "high" },
  { id: 2, patient: "Jane Smith", type: "Liver Panel", priority: "medium" },
  { id: 3, patient: "Robert Johnson", type: "Kidney Function", priority: "critical" },
];

export default function AssignReports() {
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assign Reports</h1>
          <p className="text-muted-foreground">Distribute reports to doctors for review</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Shuffle className="h-4 w-4" />
            Round Robin
          </Button>
          <Button className="gap-2">
            <UserCheck className="h-4 w-4" />
            Priority Assign
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
          <Button size="sm" variant="outline">Auto Assign All</Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Doctor Load Cards */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Doctor Workload</h2>
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
                      <Button size="sm" className="flex-1">
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
