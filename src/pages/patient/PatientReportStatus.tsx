import { FileSearch, CheckCircle, Clock, Brain, User, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  id: string;
  title: string | null;
  created_at: string;
  status: string;
  ai_confidence: number | null;
};

function progressFor(status: string) {
  const ocr = status === "uploaded" ? 50 : 100;
  const ai = ["uploaded", "ocr"].includes(status) ? 0 : 100;
  const doctor = status === "completed" ? 100 : status === "under_review" ? 50 : 0;
  return { ocr, ai, doctor };
}

export default function PatientReportStatus() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("reports")
        .select("id,title,created_at,status,ai_confidence")
        .eq("patient_id", user.id)
        .order("created_at", { ascending: false });
      setReports((data ?? []) as Row[]);
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Report Status</h1>
        <p className="text-muted-foreground">Track your report processing status</p>
      </div>

      <div className="space-y-4">
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!loading && reports.length === 0 && (
          <Card><CardContent className="p-8 text-center text-muted-foreground"><FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />No reports yet.</CardContent></Card>
        )}
        {reports.map((report) => {
          const p = progressFor(report.status);
          const conf = Math.round((report.ai_confidence ?? 0) * 100);
          return (
          <Card key={report.id}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">{report.title ?? "Untitled Report"}</h3>
                  <p className="text-sm text-muted-foreground">{new Date(report.created_at).toLocaleDateString()}</p>
                </div>
                {conf > 0 && <Badge className="bg-primary/20 text-primary">{conf}% confidence</Badge>}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FileSearch className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm flex-1">OCR Processing</span>
                  <Progress value={p.ocr} className="w-24 h-2" />
                  {p.ocr === 100 && <CheckCircle className="h-4 w-4 text-success" />}
                </div>
                <div className="flex items-center gap-3">
                  <Brain className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm flex-1">AI Analysis</span>
                  <Progress value={p.ai} className="w-24 h-2" />
                  {p.ai === 100 && <CheckCircle className="h-4 w-4 text-success" />}
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm flex-1">Doctor Review</span>
                  <Progress value={p.doctor} className="w-24 h-2" />
                  {p.doctor === 100 ? <CheckCircle className="h-4 w-4 text-success" /> : <Clock className="h-4 w-4 text-warning" />}
                </div>
              </div>
            </CardContent>
          </Card>
        );})}
      </div>
    </div>
  );
}
