import { useState } from "react";
import { Search, Download, Merge, FileCheck, Trash2, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const patients = [
  {
    id: 1,
    name: "John Doe",
    age: 45,
    gender: "Male",
    reports: [
      { id: 1, type: "Blood Test", date: "2024-01-15", status: "verified" },
      { id: 2, type: "Liver Panel", date: "2024-01-10", status: "verified" },
      { id: 3, type: "Kidney Function", date: "2023-12-20", status: "pending" },
    ],
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 32,
    gender: "Female",
    reports: [
      { id: 4, type: "Thyroid Panel", date: "2024-01-14", status: "verified" },
      { id: 5, type: "CBC", date: "2024-01-08", status: "verified" },
    ],
  },
  {
    id: 3,
    name: "Robert Johnson",
    age: 58,
    gender: "Male",
    reports: [
      { id: 6, type: "Cardiac Panel", date: "2024-01-12", status: "verified" },
      { id: 7, type: "Lipid Profile", date: "2024-01-05", status: "pending" },
      { id: 8, type: "Blood Sugar", date: "2023-12-28", status: "verified" },
      { id: 9, type: "HbA1c", date: "2023-12-15", status: "verified" },
    ],
  },
];

export default function PatientHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);

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
                          report.status === "verified"
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
