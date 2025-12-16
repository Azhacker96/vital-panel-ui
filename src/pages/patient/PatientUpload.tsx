import { useState } from "react";
import { Upload, FileText, Camera, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

export default function PatientUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const { toast } = useToast();

  const handleUpload = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          toast({ title: "Upload Complete", description: "Your report has been submitted for analysis." });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Upload Medical Report</h1>
        <p className="text-muted-foreground">Upload your medical reports for AI analysis</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-border"}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); setSelectedFile("report.pdf"); }}
          >
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Drop your file here or click to browse</p>
            <p className="text-sm text-muted-foreground mt-2">Supports PDF, JPG, PNG (Max 10MB)</p>
            <div className="mt-4 flex justify-center gap-3">
              <Button onClick={() => setSelectedFile("report.pdf")}>Browse Files</Button>
              <Button variant="outline" className="gap-2"><Camera className="h-4 w-4" />Use Camera</Button>
            </div>
          </div>

          {selectedFile && (
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">{selectedFile}</p>
                    <p className="text-sm text-muted-foreground">2.4 MB</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => { setSelectedFile(null); setUploadProgress(0); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {uploadProgress > 0 && <Progress value={uploadProgress} className="h-2" />}
              {uploadProgress === 0 && <Button onClick={handleUpload} className="w-full mt-2">Upload & Analyze</Button>}
              {uploadProgress === 100 && <p className="text-center text-sm text-success mt-2">Upload complete!</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
