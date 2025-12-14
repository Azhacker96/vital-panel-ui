import { lazy, Suspense, memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load chart components
const AIAccuracyChartComponent = lazy(() => 
  import("./ChartCard").then(module => ({ default: module.AIAccuracyChart }))
);

const ReportsPerDoctorChartComponent = lazy(() => 
  import("./ChartCard").then(module => ({ default: module.ReportsPerDoctorChart }))
);

const ReportStatusChartComponent = lazy(() => 
  import("./ChartCard").then(module => ({ default: module.ReportStatusChart }))
);

const ChartCardComponent = lazy(() => 
  import("./ChartCard").then(module => ({ default: module.ChartCard }))
);

// Chart skeleton for loading state
function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-1/4" />
      <Skeleton style={{ height }} className="w-full rounded-lg" />
    </div>
  );
}

// Memoized lazy chart wrappers
export const LazyAIAccuracyChart = memo(function LazyAIAccuracyChart() {
  return (
    <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
      <AIAccuracyChartComponent />
    </Suspense>
  );
});

export const LazyReportsPerDoctorChart = memo(function LazyReportsPerDoctorChart() {
  return (
    <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
      <ReportsPerDoctorChartComponent />
    </Suspense>
  );
});

export const LazyReportStatusChart = memo(function LazyReportStatusChart() {
  return (
    <Suspense fallback={<Skeleton className="h-[150px] w-full" />}>
      <ReportStatusChartComponent />
    </Suspense>
  );
});

interface LazyChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export const LazyChartCard = memo(function LazyChartCard({ 
  title, 
  subtitle, 
  children, 
  className 
}: LazyChartCardProps) {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <ChartCardComponent title={title} subtitle={subtitle} className={className}>
        {children}
      </ChartCardComponent>
    </Suspense>
  );
});
