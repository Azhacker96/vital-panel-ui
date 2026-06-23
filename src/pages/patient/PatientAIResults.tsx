import { Brain, CheckCircle, AlertTriangle, Info, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

type Param = { name: string; value: string; status: string; range?: string };
type Report = { id: string; title: string | null; ai_summary: string | null; parameters: Param[] };

const statusStyles = {
  normal: { bg: "bg-success/20", text: "text-success", icon: CheckCircle },
  borderline: { bg: "bg-warning/20", text: "text-warning", icon: Info },
  abnormal: { bg: "bg-destructive/20", text: "text-destructive", icon: AlertTriangle },
};

export default function PatientAIResults() {
  const { user } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("reports")
        .select("id,title,ai_summary,parameters")
        .eq("patient_id", user.id)
        .not("ai_summary", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        const params = Array.isArray(data.parameters) ? (data.parameters as unknown as Param[]) : [];
        setReport({ id: data.id, title: data.title, ai_summary: data.ai_summary, parameters: params });
      }
      setLoading(false);
    })();
  }, [user]);

  if (loading) {
    return <div className="space-y-6"><h1 className="text-2xl font-bold text-foreground">AI Analysis Results</h1><p className="text-sm text-muted-foreground">Loading…</p></div>;
  }
  if (!report) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Analysis Results</h1>
          <p className="text-muted-foreground">Easy-to-understand health insights</p>
        </div>
        <Card><CardContent className="p-8 text-center text-muted-foreground"><FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />No AI-analyzed reports yet.</CardContent></Card>
      </div>
    );
  }

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
            {report.title ?? "Latest Report"} Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {report.parameters.length === 0 && <p className="text-sm text-muted-foreground">No structured parameters extracted.</p>}
          {report.parameters.map((result, i) => {
            const style = statusStyles[result.status as keyof typeof statusStyles] ?? statusStyles.normal;
            const Icon = style.icon;
            return (
              <div key={`${result.name}-${i}`} className={`p-4 rounded-lg ${style.bg}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${style.text}`} />
                    <div>
                      <p className="font-medium">{result.name}</p>
                      {result.range && <p className="text-sm text-muted-foreground">Normal: {result.range}</p>}
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

      {report.ai_summary && (
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold mb-2">What This Means</h3>
            <p className="text-sm text-muted-foreground">{report.ai_summary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
