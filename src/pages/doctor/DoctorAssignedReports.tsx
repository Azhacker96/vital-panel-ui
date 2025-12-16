import { useState } from "react";
import { Search, Filter, Clock, CheckCircle, Eye, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const reports = [
  { id: 1, patient: "John Anderson", type: "Blood Test", date: "2024-01-15", confidence: 94, status: "pending", priority: "normal", aiSummary: "All values within normal range" },
  { id: 2, patient: "Emily Johnson", type: "X-Ray Analysis", date: "2024-01-15", confidence: 87, status: "under_review", priority: "critical", aiSummary: "Possible abnormality detected in left lung" },
  { id: 3, patient: "Michael Davis", type: "MRI Scan", date: "2024-01-14", confidence: 91, status: "pending", priority: "normal", aiSummary: "No significant findings" },
  { id: 4, patient: "Sarah Wilson", type: "ECG Report", date: "2024-01-14", confidence: 78, status: "pending", priority: "critical", aiSummary: "Irregular heart rhythm detected" },
  { id: 5, patient: "Robert Brown", type: "Lipid Panel", date: "2024-01-13", confidence: 96, status: "completed", priority: "normal", aiSummary: "Cholesterol levels elevated" },
  { id: 6, patient: "Lisa Martinez", type: "Thyroid Panel", date: "2024-01-13", confidence: 92, status: "completed", priority: "normal", aiSummary: "TSH levels normal" },
];

const statusFilters = [
  { label: "All", value: "all", icon: Filter },
  { label: "Pending", value: "pending", icon: Clock },
  { label: "Under Review", value: "under_review", icon: Eye },
  { label: "Completed", value: "completed", icon: CheckCircle },
];

const statusStyles = {
  pending: "bg-warning/20 text-warning",
  under_review: "bg-primary/20 text-primary",
  completed: "bg-success/20 text-success",
};

const priorityStyles = {
  normal: "bg-muted text-muted-foreground",
  critical: "bg-destructive/20 text-destructive",
};

export default function DoctorAssignedReports() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

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
                <Button size="sm" className="flex-1 sm:flex-none">
                  Review Report
                </Button>
                <Button size="sm" variant="outline" className="flex-1 sm:flex-none">
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
