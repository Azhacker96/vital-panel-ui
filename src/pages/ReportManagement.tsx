import { useState } from "react";
import { Upload, FileText, Filter, CheckCircle, Clock, XCircle, AlertTriangle, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const filters = [
  { label: "All", value: "all", icon: FileText },
  { label: "Done", value: "done", icon: CheckCircle },
  { label: "Pending", value: "pending", icon: Clock },
  { label: "Under Review", value: "review", icon: Brain },
  { label: "OCR Rejected", value: "ocr-rejected", icon: XCircle },
  { label: "Critical", value: "critical", icon: AlertTriangle },
];

const reports = [
  { id: 1, patient: "John Doe", type: "Blood Test", date: "2024-01-15", status: "done", confidence: 95, parameters: [
    { name: "Hemoglobin", value: "14.5", unit: "g/dL", status: "normal" },
    { name: "WBC", value: "7,500", unit: "/µL", status: "normal" },
    { name: "Platelets", value: "150,000", unit: "/µL", status: "low" },
  ]},
  { id: 2, patient: "Jane Smith", type: "Liver Panel", date: "2024-01-14", status: "pending", confidence: 87, parameters: [
    { name: "ALT", value: "85", unit: "U/L", status: "high" },
    { name: "AST", value: "72", unit: "U/L", status: "high" },
    { name: "Bilirubin", value: "1.0", unit: "mg/dL", status: "normal" },
  ]},
  { id: 3, patient: "Robert Johnson", type: "Kidney Function", date: "2024-01-13", status: "critical", confidence: 92, parameters: [
    { name: "Creatinine", value: "3.2", unit: "mg/dL", status: "critical" },
    { name: "BUN", value: "45", unit: "mg/dL", status: "high" },
    { name: "eGFR", value: "28", unit: "mL/min", status: "critical" },
  ]},
  { id: 4, patient: "Emily Davis", type: "Thyroid Panel", date: "2024-01-12", status: "review", confidence: 78, parameters: [
    { name: "TSH", value: "4.8", unit: "mIU/L", status: "normal" },
    { name: "T4", value: "1.2", unit: "ng/dL", status: "normal" },
  ]},
];

const statusStyles = {
  done: { bg: "bg-success/10", text: "text-success", border: "border-success/30" },
  pending: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/30" },
  review: { bg: "bg-secondary/10", text: "text-secondary", border: "border-secondary/30" },
  critical: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/30" },
  "ocr-rejected": { bg: "bg-muted", text: "text-muted-foreground", border: "border-muted" },
};

const parameterStatusColors = {
  normal: "bg-success/10 text-success",
  low: "bg-warning/10 text-warning",
  high: "bg-warning/10 text-warning",
  critical: "bg-destructive/10 text-destructive",
};

export default function ReportManagement() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isDragging, setIsDragging] = useState(false);

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
        {filteredReports.map((report, index) => {
          const statusStyle = statusStyles[report.status as keyof typeof statusStyles];
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
              <div className="mt-4 space-y-2">
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
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button size="sm" className="flex-1">
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
