import { MessageSquare, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const feedbacks = [
  { id: 1, doctor: "Dr. Sarah Smith", date: "2024-01-15", report: "Blood Test", comment: "Results look good overall. Consider reducing sugar intake.", followUp: "Schedule follow-up in 3 months" },
  { id: 2, doctor: "Dr. Michael Brown", date: "2024-01-10", report: "X-Ray", comment: "No abnormalities detected. Lungs are clear.", followUp: null },
];

export default function PatientFeedback() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Doctor Feedback</h1>
        <p className="text-muted-foreground">Comments and recommendations from your doctors</p>
      </div>

      <div className="space-y-4">
        {feedbacks.map((feedback) => (
          <Card key={feedback.id}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{feedback.doctor}</h3>
                    <span className="text-sm text-muted-foreground">{feedback.date}</span>
                  </div>
                  <Badge variant="outline" className="mt-1">{feedback.report}</Badge>
                  <p className="mt-3 text-sm text-muted-foreground">{feedback.comment}</p>
                  {feedback.followUp && (
                    <div className="mt-3 p-3 bg-primary/5 rounded-lg">
                      <p className="text-sm font-medium text-primary">{feedback.followUp}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
