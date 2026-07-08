import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({ title, subtitle, children, className }: ChartCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-5 card-shadow animate-slide-up", className)}>
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function AIAccuracyChart({ data }: { data: { name: string; value: number }[] }) {
  const empty = !data.length || data.every((d) => !d.value);
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(204, 70%, 53%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(204, 70%, 53%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(210, 10%, 45%)" />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(210, 10%, 45%)" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: "hsl(0, 0%, 100%)", 
            border: "1px solid hsl(210, 20%, 90%)",
            borderRadius: "8px",
            fontSize: "12px"
          }} 
        />
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke="hsl(204, 70%, 53%)" 
          strokeWidth={2}
          fillOpacity={1} 
          fill="url(#colorAccuracy)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ReportsPerDoctorChart({ data }: { data: { name: string; reports: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(210, 10%, 45%)" />
        <YAxis tick={{ fontSize: 12 }} stroke="hsl(210, 10%, 45%)" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: "hsl(0, 0%, 100%)", 
            border: "1px solid hsl(210, 20%, 90%)",
            borderRadius: "8px",
            fontSize: "12px"
          }} 
        />
        <Bar dataKey="reports" fill="hsl(204, 70%, 53%)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ReportStatusChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  const total = data.reduce((a, b) => a + b.value, 0);
  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width={150} height={150}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={60}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "hsl(0, 0%, 100%)", 
              border: "1px solid hsl(210, 20%, 90%)",
              borderRadius: "8px",
              fontSize: "12px"
            }} 
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-sm text-muted-foreground">
              {item.name}: {total ? Math.round((item.value / total) * 100) : 0}% ({item.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
