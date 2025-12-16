import { History, Download, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const history = [
  { id: 1, type: "Blood Test", date: "2024-01-15", status: "completed" },
  { id: 2, type: "X-Ray Analysis", date: "2024-01-10", status: "completed" },
  { id: 3, type: "ECG Report", date: "2023-12-20", status: "completed" },
  { id: 4, type: "Lipid Panel", date: "2023-11-15", status: "completed" },
];

export default function PatientHistory() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Medical History</h1>
        <p className="text-muted-foreground">View and download your past reports</p>
      </div>

      <div className="space-y-3">
        {history.map((item, index) => (
          <Card key={item.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{item.type}</p>
                    <p className="text-sm text-muted-foreground">{item.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-success/20 text-success">{item.status}</Badge>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Download className="h-3 w-3" />
                    PDF
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
