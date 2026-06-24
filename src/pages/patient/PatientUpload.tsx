import { useState, useRef } from "react";
import { Upload, FileText, Camera, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

export default function PatientUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const pickFile = (file: File | null) => {
    if (!file) return;
    if (!ALLOWED.includes(file.type)) {
      toast({ title: 'Unsupported file', description: 'Use PDF, JPG, or PNG.', variant: 'destructive' });
      return;
    }
    if (file.size > MAX_BYTES) {
      toast({ title: 'File too large', description: 'Maximum size is 10MB.', variant: 'destructive' });
      return;
    }
    setSelectedFile(file);
    setUploadProgress(0);
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;
    setBusy(true);
    setUploadProgress(10);
    const safeName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${user.id}/${Date.now()}-${safeName}`;
    const { error: upErr } = await supabase.storage
      .from('medical-reports')
      .upload(path, selectedFile, { contentType: selectedFile.type, upsert: false });
    if (upErr) {
      setBusy(false); setUploadProgress(0);
      toast({ title: 'Upload failed', description: upErr.message, variant: 'destructive' });
      return;
    }
    setUploadProgress(70);
    const { data: inserted, error: insErr } = await supabase.from('reports').insert({
      patient_id: user.id,
      uploaded_by: user.id,
      title: selectedFile.name,
      file_path: path,
      file_type: selectedFile.type,
      status: 'uploaded',
    }).select('id').single();
    if (insErr) {
      setBusy(false); setUploadProgress(0);
      toast({ title: 'Saving record failed', description: insErr.message, variant: 'destructive' });
      return;
    }
    setUploadProgress(90);
    // Kick off AI analysis (don't block UX on failure)
    supabase.functions.invoke('analyze-report', { body: { report_id: inserted.id } }).catch(() => {});
    setUploadProgress(100);
    setBusy(false);
    toast({ title: 'Upload complete', description: 'Your report has been submitted for analysis.' });
    setTimeout(() => navigate('/patient/status'), 800);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Upload Medical Report</h1>
        <p className="text-muted-foreground">Upload your medical reports for AI analysis</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="application/pdf,image/png,image/jpeg"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-border"}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); pickFile(e.dataTransfer.files?.[0] ?? null); }}
          >
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Drop your file here or click to browse</p>
            <p className="text-sm text-muted-foreground mt-2">Supports PDF, JPG, PNG (Max 10MB)</p>
            <div className="mt-4 flex justify-center gap-3">
              <Button onClick={() => inputRef.current?.click()}>Browse Files</Button>
              <Button variant="outline" className="gap-2" onClick={() => inputRef.current?.click()}>
                <Camera className="h-4 w-4" />Use Camera
              </Button>
            </div>
          </div>

          {selectedFile && (
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => { setSelectedFile(null); setUploadProgress(0); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {uploadProgress > 0 && <Progress value={uploadProgress} className="h-2" />}
              {uploadProgress === 0 && <Button onClick={handleUpload} disabled={busy} className="w-full mt-2">Upload & Analyze</Button>}
              {uploadProgress === 100 && <p className="text-center text-sm text-success mt-2">Upload complete!</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
