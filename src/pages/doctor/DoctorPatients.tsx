import { useState } from "react";
import { Search, User, FileText, Download, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const patients = [
  {
    id: 1,
    name: "John Anderson",
    email: "john.a@email.com",
    age: 45,
    gender: "Male",
    bloodType: "O+",
    totalReports: 12,
    lastVisit: "2024-01-15",
    conditions: ["Hypertension", "Type 2 Diabetes"],
    recentReports: [
      { type: "Blood Test", date: "2024-01-15", status: "completed" },
      { type: "ECG", date: "2024-01-10", status: "completed" },
    ],
  },
  {
    id: 2,
    name: "Emily Johnson",
    email: "emily.j@email.com",
    age: 32,
    gender: "Female",
    bloodType: "A+",
    totalReports: 8,
    lastVisit: "2024-01-15",
    conditions: ["Asthma"],
    recentReports: [
      { type: "X-Ray", date: "2024-01-15", status: "under_review" },
      { type: "Pulmonary Function", date: "2024-01-05", status: "completed" },
    ],
  },
  {
    id: 3,
    name: "Michael Davis",
    email: "m.davis@email.com",
    age: 58,
    gender: "Male",
    bloodType: "B-",
    totalReports: 24,
    lastVisit: "2024-01-14",
    conditions: ["Coronary Artery Disease", "High Cholesterol"],
    recentReports: [
      { type: "MRI Scan", date: "2024-01-14", status: "pending" },
      { type: "Lipid Panel", date: "2024-01-08", status: "completed" },
    ],
  },
];

const statusColors = {
  pending: "bg-warning/20 text-warning",
  under_review: "bg-primary/20 text-primary",
  completed: "bg-success/20 text-success",
};

export default function DoctorPatients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<typeof patients[0] | null>(null);

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Patient Profiles</h1>
        <p className="text-muted-foreground">View patient information and medical history</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
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
        <div className="lg:col-span-1 space-y-4">
          {filteredPatients.map((patient, index) => (
            <Card
              key={patient.id}
              className={`cursor-pointer transition-all hover:shadow-md animate-slide-up ${
                selectedPatient?.id === patient.id ? "ring-2 ring-primary" : ""
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => setSelectedPatient(patient)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{patient.name}</h3>
                    <p className="text-sm text-muted-foreground">{patient.age} yrs • {patient.gender}</p>
                  </div>
                  <Badge variant="outline">{patient.totalReports} reports</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Patient Details */}
        <div className="lg:col-span-2">
          {selectedPatient ? (
            <div className="space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Patient Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium">{selectedPatient.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedPatient.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Age / Gender</p>
                      <p className="font-medium">{selectedPatient.age} years / {selectedPatient.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Blood Type</p>
                      <p className="font-medium">{selectedPatient.bloodType}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-sm text-muted-foreground mb-2">Known Conditions</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedPatient.conditions.map((condition) => (
                          <Badge key={condition} variant="outline">{condition}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Medical History Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Recent Reports
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedPatient.recentReports.map((report, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{report.type}</p>
                          <p className="text-sm text-muted-foreground">{report.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={statusColors[report.status as keyof typeof statusColors]}>
                          {report.status.replace("_", " ")}
                        </Badge>
                        <Button size="sm" variant="outline" className="gap-1">
                          <Download className="h-3 w-3" />
                          PDF
                        </Button>
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
