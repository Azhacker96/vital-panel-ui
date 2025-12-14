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
import { ChartCard, AIAccuracyChart, ReportsPerDoctorChart, ReportStatusChart } from "@/components/dashboard/ChartCard";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your medical reports and analytics</p>
      </div>

      {/* Report Statistics */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Report Statistics</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Reports"
            value="1,284"
            icon={FileText}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Completed Reports"
            value="892"
            icon={CheckCircle}
            variant="success"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Pending Reports"
            value="247"
            icon={Clock}
            variant="warning"
            trend={{ value: 3, isPositive: false }}
          />
          <StatCard
            title="Rejected Reports"
            value="145"
            icon={XCircle}
            variant="destructive"
            trend={{ value: 5, isPositive: false }}
          />
        </div>
      </section>

      {/* Patient Statistics */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Patient Statistics</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Patients"
            value="3,847"
            icon={Users}
            trend={{ value: 15, isPositive: true }}
          />
          <StatCard
            title="Active Patients"
            value="2,156"
            icon={UserCheck}
            variant="secondary"
          />
          <StatCard
            title="High-Risk Patients"
            value="89"
            icon={AlertTriangle}
            variant="destructive"
          />
        </div>
      </section>

      {/* AI & System Analytics */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">AI & System Analytics</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="AI Accuracy"
            value="94.2%"
            icon={Brain}
            variant="success"
            trend={{ value: 2.1, isPositive: true }}
          />
          <StatCard
            title="Confidence Score"
            value="87.5%"
            icon={Target}
            variant="secondary"
          />
          <StatCard
            title="Daily Processing"
            value="156"
            icon={TrendingUp}
            trend={{ value: 18, isPositive: true }}
          />
        </div>
      </section>

      {/* Charts Section */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Analytics Charts</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="AI Accuracy Trend" subtitle="Last 7 days performance">
            <AIAccuracyChart />
          </ChartCard>
          <ChartCard title="Reports per Doctor" subtitle="Current month breakdown">
            <ReportsPerDoctorChart />
          </ChartCard>
        </div>
        <div className="mt-4">
          <ChartCard title="Report Status Distribution" subtitle="Overall status breakdown">
            <ReportStatusChart />
          </ChartCard>
        </div>
      </section>
    </div>
  );
}
