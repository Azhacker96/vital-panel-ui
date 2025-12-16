import { AlertTriangle, Clock, User, ArrowUpRight, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const criticalCases = [
  {
    id: 1,
    patient: "Emily Johnson",
    type: "X-Ray Analysis",
    date: "2024-01-15",
    confidence: 87,
    reason: "Possible pneumonia detected in left lower lobe",
    severity: "high",
    timeElapsed: "2 hours ago",
  },
  {
    id: 2,
    patient: "Sarah Wilson",
    type: "ECG Report",
    date: "2024-01-14",
    confidence: 78,
    reason: "Irregular heart rhythm - possible arrhythmia",
    severity: "critical",
    timeElapsed: "6 hours ago",
  },
  {
    id: 3,
    patient: "Robert Brown",
    type: "Blood Test",
    date: "2024-01-13",
    confidence: 92,
    reason: "Severely elevated liver enzymes",
    severity: "high",
    timeElapsed: "1 day ago",
  },
];

const severityStyles = {
  critical: "bg-destructive text-destructive-foreground",
  high: "bg-warning text-warning-foreground",
  medium: "bg-primary text-primary-foreground",
};

export default function DoctorCriticalCases() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            Critical Cases
          </h1>
          <p className="text-muted-foreground">Cases requiring immediate attention</p>
        </div>
        <Badge variant="destructive" className="text-lg px-4 py-2">
          {criticalCases.length} Active Alerts
        </Badge>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-destructive/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-3xl font-bold text-destructive">1</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-warning/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-3xl font-bold text-warning">2</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
                <p className="text-3xl font-bold text-foreground">18m</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Cases List */}
      <div className="space-y-4">
        {criticalCases.map((caseItem, index) => (
          <Card 
            key={caseItem.id} 
            className={`animate-slide-up border-l-4 ${
              caseItem.severity === "critical" ? "border-l-destructive" : "border-l-warning"
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge className={severityStyles[caseItem.severity as keyof typeof severityStyles]}>
                      {caseItem.severity.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{caseItem.timeElapsed}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold text-foreground">{caseItem.patient}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{caseItem.type}</span>
                  </div>
                  
                  <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">Alert:</span> {caseItem.reason}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>AI Confidence: </span>
                    <span className={`font-semibold ${caseItem.confidence < 85 ? "text-warning" : "text-foreground"}`}>
                      {caseItem.confidence}%
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button className="gap-2">
                    <ArrowUpRight className="h-4 w-4" />
                    Review Now
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Phone className="h-4 w-4" />
                    Contact Patient
                  </Button>
                  <Button variant="outline">
                    Escalate to Admin
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
