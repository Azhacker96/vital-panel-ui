import { useState } from "react";
import { FileText, Check, X, AlertTriangle, Edit, MessageSquare, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const sampleReport = {
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
  const [editMode, setEditMode] = useState<number | null>(null);
  const [values, setValues] = useState(sampleReport.extractedValues);
  const [comment, setComment] = useState("");
  const [isCritical, setIsCritical] = useState(sampleReport.priority === "critical");
  const { toast } = useToast();

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

  const handleApprove = () => {
    toast({
      title: "Report Approved",
      description: "The report has been approved and sent to the patient.",
    });
  };

  const handleReject = () => {
    toast({
      title: "Report Rejected",
      description: "The report has been rejected and flagged for re-review.",
      variant: "destructive",
    });
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
                <p className="text-sm text-muted-foreground">X-Ray Image Preview</p>
                <p className="text-xs text-muted-foreground mt-1">{sampleReport.patient} - {sampleReport.date}</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-muted/30 rounded-lg">
              <p className="text-xs font-medium text-muted-foreground mb-2">OCR Extracted Text:</p>
              <p className="text-sm text-foreground whitespace-pre-line">{sampleReport.ocrText}</p>
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
                  <h3 className="font-semibold text-foreground">{sampleReport.patient}</h3>
                  <p className="text-sm text-muted-foreground">{sampleReport.type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${isCritical ? "bg-destructive/20 text-destructive" : "bg-muted text-muted-foreground"}`}>
                    {isCritical ? "Critical" : "Normal"}
                  </Badge>
                  <span className="text-sm">AI: <span className="font-semibold">{sampleReport.confidence}%</span></span>
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
              <p className="text-sm text-muted-foreground">{sampleReport.aiSummary}</p>
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
            <Button onClick={handleApprove} className="flex-1 gap-2 bg-success hover:bg-success/90">
              <Check className="h-4 w-4" />
              Approve Report
            </Button>
            <Button onClick={handleReject} variant="destructive" className="flex-1 gap-2">
              <X className="h-4 w-4" />
              Reject Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
