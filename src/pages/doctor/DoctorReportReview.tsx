import { useEffect, useState } from "react";
import { FileText, Check, X, AlertTriangle, Edit, MessageSquare, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from "react-router-dom";

const fallbackReport = {
  id: 1,
  patient: "Emily Johnson",
  type: "X-Ray Analysis",
  date: "2024-01-15",
  confidence: 87,
  status: "under_review",
  priority: "critical",
  extractedValues: [
    { name: "Heart Size", value: "Normal", status: "normal", editable: true },
    { name: "Lung Fields", value: "Opacity detected in left lower lobe", status: "abnormal", editable: true },
    { name: "Bone Structure", value: "No fractures visible", status: "normal", editable: true },
    { name: "Mediastinum", value: "Within normal limits", status: "normal", editable: true },
  ],
  aiSummary: "AI detected possible opacity in the left lower lung lobe which may indicate pneumonia or other pulmonary condition. Recommend clinical correlation and possibly CT scan for further evaluation.",
  ocrText: "Patient Name: Emily Johnson\nDate: 2024-01-15\nModality: Chest X-Ray PA View\nFindings: Left lower lobe opacity noted...",
};

const statusColors = {
  normal: "bg-success/20 text-success border-success/30",
  abnormal: "bg-destructive/20 text-destructive border-destructive/30",
  borderline: "bg-warning/20 text-warning border-warning/30",
};

export default function DoctorReportReview() {
  const { user } = useAuth();
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [editMode, setEditMode] = useState<number | null>(null);
  const [report, setReport] = useState<any>(null);
  const [values, setValues] = useState(fallbackReport.extractedValues);
  const [comment, setComment] = useState("");
  const [isCritical, setIsCritical] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Pick most recent assigned report if no route id
      let reportId = routeId;
      if (!reportId) {
        const { data: a } = await supabase
          .from("report_assignments")
          .select("report_id,assigned_at")
          .eq("doctor_id", user.id)
          .order("assigned_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        reportId = a?.report_id;
      }
      if (!reportId) return;
      const { data: r } = await supabase
        .from("reports")
        .select("id,title,created_at,ai_confidence,ai_summary,ocr_text,parameters,is_critical,patient_id,status")
        .eq("id", reportId)
        .maybeSingle();
      if (!r) return;
      const { data: profile } = await supabase.from("profiles").select("first_name,last_name").eq("id", r.patient_id).maybeSingle();
      const patientName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Patient";
      const params = Array.isArray(r.parameters) ? (r.parameters as any[]) : [];
      setReport({
        ...r,
        patient: patientName,
        type: r.title ?? "Report",
        date: new Date(r.created_at).toLocaleDateString(),
        confidence: Math.round((r.ai_confidence ?? 0) * 100),
      });
      setIsCritical(!!r.is_critical);
      if (params.length > 0) {
        setValues(params.map((p) => ({ name: p.name, value: String(p.value ?? ""), status: p.status ?? "normal", editable: true })));
      }
    })();
  }, [user, routeId]);

  const data = report ?? { ...fallbackReport, patient: fallbackReport.patient, type: fallbackReport.type, date: fallbackReport.date, confidence: fallbackReport.confidence };

  const handleValueChange = (index: number, newValue: string) => {
    const updated = [...values];
    updated[index].value = newValue;
    setValues(updated);
  };

  const handleStatusChange = (index: number, newStatus: string) => {
    const updated = [...values];
    updated[index].status = newStatus as "normal" | "abnormal" | "borderline";
    setValues(updated);
  };

  const submitReview = async (approved: boolean) => {
    if (!user || !report) { toast({ title: "Demo report — connect a real one to save." }); return; }
    setSaving(true);
    const { error: revErr } = await supabase.from("doctor_reviews").insert({
      report_id: report.id, doctor_id: user.id, comments: comment, approved,
    });
    if (revErr) { toast({ title: "Failed", description: revErr.message, variant: "destructive" }); setSaving(false); return; }
    const newStatus = approved ? (isCritical ? "critical" : "completed") : "under_review";
    await supabase.from("reports").update({
      status: newStatus, is_critical: isCritical, parameters: values as any,
    }).eq("id", report.id);
    await supabase.from("notifications").insert({
      user_id: report.patient_id,
      type: approved ? "completed" : "alert",
      title: approved ? "Report Reviewed" : "Report Needs More Review",
      body: comment || (approved ? "Your report has been reviewed." : "Your report requires re-review."),
    });
    toast({ title: approved ? "Report Approved" : "Report Rejected", variant: approved ? "default" : "destructive" });
    setSaving(false);
    navigate("/doctor/reports");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Report Review</h1>
          <p className="text-muted-foreground">Review and validate AI-extracted data</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Report Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Original Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
              <div className="text-center p-4">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Report Preview</p>
                <p className="text-xs text-muted-foreground mt-1">{data.patient} - {data.date}</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-muted/30 rounded-lg">
              <p className="text-xs font-medium text-muted-foreground mb-2">OCR Extracted Text:</p>
              <p className="text-sm text-foreground whitespace-pre-line">{(report?.ocr_text) ?? fallbackReport.ocrText}</p>
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis & Edit */}
        <div className="space-y-6">
          {/* Patient Info */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{data.patient}</h3>
                  <p className="text-sm text-muted-foreground">{data.type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${isCritical ? "bg-destructive/20 text-destructive" : "bg-muted text-muted-foreground"}`}>
                    {isCritical ? "Critical" : "Normal"}
                  </Badge>
                  <span className="text-sm">AI: <span className="font-semibold">{data.confidence}%</span></span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                AI Analysis Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{report?.ai_summary ?? fallbackReport.aiSummary}</p>
            </CardContent>
          </Card>

          {/* Extracted Values */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Extracted Values</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {values.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">{item.name}</Label>
                    <div className="flex items-center gap-2">
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(index, e.target.value)}
                        className="text-xs rounded border bg-background px-2 py-1"
                      >
                        <option value="normal">Normal</option>
                        <option value="abnormal">Abnormal</option>
                        <option value="borderline">Borderline</option>
                      </select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setEditMode(editMode === index ? null : index)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  {editMode === index ? (
                    <Input
                      value={item.value}
                      onChange={(e) => handleValueChange(index, e.target.value)}
                      className="text-sm"
                    />
                  ) : (
                    <div className={`p-2 rounded text-sm ${statusColors[item.status]}`}>
                      {item.value}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Doctor Comments */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Doctor Comments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Add your medical comments and recommendations..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="critical"
                  checked={isCritical}
                  onChange={(e) => setIsCritical(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="critical" className="text-sm">Mark as Critical Case</Label>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={() => submitReview(true)} disabled={saving} className="flex-1 gap-2 bg-success hover:bg-success/90">
              <Check className="h-4 w-4" />
              Approve Report
            </Button>
            <Button onClick={() => submitReview(false)} disabled={saving} variant="destructive" className="flex-1 gap-2">
              <X className="h-4 w-4" />
              Reject Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
