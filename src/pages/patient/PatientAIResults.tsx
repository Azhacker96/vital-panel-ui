import { Brain, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const results = [
  { name: "Hemoglobin", value: "14.2 g/dL", status: "normal", range: "12-16 g/dL" },
  { name: "Blood Sugar", value: "110 mg/dL", status: "borderline", range: "70-100 mg/dL" },
  { name: "Cholesterol", value: "245 mg/dL", status: "abnormal", range: "<200 mg/dL" },
  { name: "Blood Pressure", value: "120/80", status: "normal", range: "<120/80" },
];

const statusStyles = {
  normal: { bg: "bg-success/20", text: "text-success", icon: CheckCircle },
  borderline: { bg: "bg-warning/20", text: "text-warning", icon: Info },
  abnormal: { bg: "bg-destructive/20", text: "text-destructive", icon: AlertTriangle },
};

export default function PatientAIResults() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Analysis Results</h1>
        <p className="text-muted-foreground">Easy-to-understand health insights</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Blood Test Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {results.map((result) => {
            const style = statusStyles[result.status as keyof typeof statusStyles];
            const Icon = style.icon;
            return (
              <div key={result.name} className={`p-4 rounded-lg ${style.bg}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${style.text}`} />
                    <div>
                      <p className="font-medium">{result.name}</p>
                      <p className="text-sm text-muted-foreground">Normal: {result.range}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{result.value}</p>
                    <Badge variant="outline" className={style.text}>{result.status}</Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold mb-2">What This Means</h3>
          <p className="text-sm text-muted-foreground">
            Your results show mostly normal values. Your cholesterol is slightly elevated - consider dietary changes and consult your doctor for personalized advice.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
