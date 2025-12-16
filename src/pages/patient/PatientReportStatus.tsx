import { FileSearch, CheckCircle, Clock, Brain, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const reports = [
  { id: 1, type: "Blood Test", date: "2024-01-15", ocrStatus: 100, aiStatus: 100, doctorStatus: 50, confidence: 94 },
  { id: 2, type: "X-Ray Analysis", date: "2024-01-14", ocrStatus: 100, aiStatus: 100, doctorStatus: 0, confidence: 87 },
];

export default function PatientReportStatus() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Report Status</h1>
        <p className="text-muted-foreground">Track your report processing status</p>
      </div>

      <div className="space-y-4">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">{report.type}</h3>
                  <p className="text-sm text-muted-foreground">{report.date}</p>
                </div>
                <Badge className="bg-primary/20 text-primary">{report.confidence}% confidence</Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FileSearch className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm flex-1">OCR Processing</span>
                  <Progress value={report.ocrStatus} className="w-24 h-2" />
                  {report.ocrStatus === 100 && <CheckCircle className="h-4 w-4 text-success" />}
                </div>
                <div className="flex items-center gap-3">
                  <Brain className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm flex-1">AI Analysis</span>
                  <Progress value={report.aiStatus} className="w-24 h-2" />
                  {report.aiStatus === 100 && <CheckCircle className="h-4 w-4 text-success" />}
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm flex-1">Doctor Review</span>
                  <Progress value={report.doctorStatus} className="w-24 h-2" />
                  {report.doctorStatus === 100 ? <CheckCircle className="h-4 w-4 text-success" /> : <Clock className="h-4 w-4 text-warning" />}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
