import { memo, useMemo } from "react";
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Users, 
  UserCheck, 
  AlertTriangle,
  Brain,
  Target,
  TrendingUp
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { 
  LazyChartCard, 
  LazyAIAccuracyChart, 
  LazyReportsPerDoctorChart, 
  LazyReportStatusChart 
} from "@/components/dashboard/LazyCharts";

// Memoized stat data to prevent recalculation
const useStatData = () => {
  return useMemo(() => ({
    reports: [
      { title: "Total Reports", value: "1,284", icon: FileText, trend: { value: 12, isPositive: true } },
      { title: "Completed Reports", value: "892", icon: CheckCircle, variant: "success" as const, trend: { value: 8, isPositive: true } },
      { title: "Pending Reports", value: "247", icon: Clock, variant: "warning" as const, trend: { value: 3, isPositive: false } },
      { title: "Rejected Reports", value: "145", icon: XCircle, variant: "destructive" as const, trend: { value: 5, isPositive: false } },
    ],
    patients: [
      { title: "Total Patients", value: "3,847", icon: Users, trend: { value: 15, isPositive: true } },
      { title: "Active Patients", value: "2,156", icon: UserCheck, variant: "secondary" as const },
      { title: "High-Risk Patients", value: "89", icon: AlertTriangle, variant: "destructive" as const },
    ],
    ai: [
      { title: "AI Accuracy", value: "94.2%", icon: Brain, variant: "success" as const, trend: { value: 2.1, isPositive: true } },
      { title: "Confidence Score", value: "87.5%", icon: Target, variant: "secondary" as const },
      { title: "Daily Processing", value: "156", icon: TrendingUp, trend: { value: 18, isPositive: true } },
    ],
  }), []);
};

// Memoized section components
const ReportStatsSection = memo(function ReportStatsSection({ data }: { data: ReturnType<typeof useStatData>["reports"] }) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-foreground">Report Statistics</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>
    </section>
  );
});

const PatientStatsSection = memo(function PatientStatsSection({ data }: { data: ReturnType<typeof useStatData>["patients"] }) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-foreground">Patient Statistics</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>
    </section>
  );
});

const AIStatsSection = memo(function AIStatsSection({ data }: { data: ReturnType<typeof useStatData>["ai"] }) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-foreground">AI & System Analytics</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>
    </section>
  );
});

const ChartsSection = memo(function ChartsSection() {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-foreground">Analytics Charts</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        <LazyChartCard title="AI Accuracy Trend" subtitle="Last 7 days performance">
          <LazyAIAccuracyChart />
        </LazyChartCard>
        <LazyChartCard title="Reports per Doctor" subtitle="Current month breakdown">
          <LazyReportsPerDoctorChart />
        </LazyChartCard>
      </div>
      <div className="mt-4">
        <LazyChartCard title="Report Status Distribution" subtitle="Overall status breakdown">
          <LazyReportStatusChart />
        </LazyChartCard>
      </div>
    </section>
  );
});

export default memo(function Dashboard() {
  const statData = useStatData();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your medical reports and analytics</p>
      </div>

      <ReportStatsSection data={statData.reports} />
      <PatientStatsSection data={statData.patients} />
      <AIStatsSection data={statData.ai} />
      <ChartsSection />
    </div>
  );
});
