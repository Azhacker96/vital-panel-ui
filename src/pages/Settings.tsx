import { useState } from "react";
import { Palette, FileType, Brain, Settings2, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const colorThemes = [
  { name: "Blue", color: "hsl(204, 70%, 53%)" },
  { name: "Green", color: "hsl(145, 63%, 42%)" },
  { name: "Purple", color: "hsl(280, 60%, 50%)" },
  { name: "Orange", color: "hsl(36, 100%, 50%)" },
];

const fileFormats = ["PDF", "JPG", "PNG", "TIFF", "DICOM"];

export default function Settings() {
  const [aiLearningMode, setAiLearningMode] = useState(true);
  const [autoAssignment, setAutoAssignment] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState([80]);
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [selectedFormats, setSelectedFormats] = useState(["PDF", "JPG", "PNG"]);

  const toggleFormat = (format: string) => {
    setSelectedFormats((prev) =>
      prev.includes(format)
        ? prev.filter((f) => f !== format)
        : [...prev, format]
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Configure system and application settings</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Appearance */}
        <div className="rounded-lg border bg-card p-5 card-shadow animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-secondary/10 p-2">
              <Palette className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Color Theme</h3>
              <p className="text-sm text-muted-foreground">Choose your accent color</p>
            </div>
          </div>
          <div className="flex gap-3">
            {colorThemes.map((theme, index) => (
              <button
                key={theme.name}
                onClick={() => setSelectedTheme(index)}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full transition-all",
                  selectedTheme === index && "ring-2 ring-offset-2 ring-foreground"
                )}
                style={{ backgroundColor: theme.color }}
              >
                {selectedTheme === index && (
                  <span className="text-white text-sm">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* File Formats */}
        <div className="rounded-lg border bg-card p-5 card-shadow animate-slide-up" style={{ animationDelay: "50ms" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-secondary/10 p-2">
              <FileType className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Allowed File Formats</h3>
              <p className="text-sm text-muted-foreground">Select accepted upload formats</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {fileFormats.map((format) => (
              <Button
                key={format}
                variant={selectedFormats.includes(format) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFormat(format)}
              >
                {format}
              </Button>
            ))}
          </div>
        </div>

        {/* AI Settings */}
        <div className="rounded-lg border bg-card p-5 card-shadow animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-secondary/10 p-2">
              <Brain className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">AI Settings</h3>
              <p className="text-sm text-muted-foreground">Configure AI behavior</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">AI Learning Mode</p>
                <p className="text-sm text-muted-foreground">Allow AI to learn from corrections</p>
              </div>
              <Switch checked={aiLearningMode} onCheckedChange={setAiLearningMode} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium text-foreground">Confidence Threshold</p>
                <span className="text-sm font-medium text-secondary">{confidenceThreshold[0]}%</span>
              </div>
              <Slider
                value={confidenceThreshold}
                onValueChange={setConfidenceThreshold}
                max={100}
                min={50}
                step={5}
              />
              <p className="text-xs text-muted-foreground">Reports below this threshold require manual review</p>
            </div>
          </div>
        </div>

        {/* Assignment Rules */}
        <div className="rounded-lg border bg-card p-5 card-shadow animate-slide-up" style={{ animationDelay: "150ms" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-secondary/10 p-2">
              <Settings2 className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Assignment Rules</h3>
              <p className="text-sm text-muted-foreground">Configure report distribution</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Auto Assignment</p>
                <p className="text-sm text-muted-foreground">Automatically assign new reports</p>
              </div>
              <Switch checked={autoAssignment} onCheckedChange={setAutoAssignment} />
            </div>
            <div className="space-y-2">
              <p className="font-medium text-foreground">Assignment Method</p>
              <div className="flex gap-2">
                <Button variant="default" size="sm">Round Robin</Button>
                <Button variant="outline" size="sm">Priority Based</Button>
                <Button variant="outline" size="sm">Load Balanced</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Processing Rules */}
        <div className="lg:col-span-2 rounded-lg border bg-card p-5 card-shadow animate-slide-up" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-secondary/10 p-2">
              <Sliders className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Report Processing Rules</h3>
              <p className="text-sm text-muted-foreground">Define how reports are processed</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="font-medium text-foreground">Critical Parameters</p>
              <p className="text-sm text-muted-foreground mt-1">Flag reports with values outside safe ranges</p>
              <Switch className="mt-3" defaultChecked />
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="font-medium text-foreground">Duplicate Detection</p>
              <p className="text-sm text-muted-foreground mt-1">Alert on potential duplicate reports</p>
              <Switch className="mt-3" defaultChecked />
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="font-medium text-foreground">OCR Validation</p>
              <p className="text-sm text-muted-foreground mt-1">Require validation for low-quality scans</p>
              <Switch className="mt-3" defaultChecked />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
