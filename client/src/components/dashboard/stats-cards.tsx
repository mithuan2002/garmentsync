import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Clock, MessageSquare, CheckCircle } from "lucide-react";

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
                <div className="h-3 bg-slate-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Active Projects",
      value: stats?.activeProjects || 0,
      icon: TrendingUp,
      change: "+2 from last week",
      changeType: "positive" as const,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Pending Updates",
      value: stats?.pendingUpdates || 0,
      icon: Clock,
      change: "No change",
      changeType: "neutral" as const,
      color: "bg-warning/10 text-warning",
    },
    {
      title: "Messages Today",
      value: stats?.messagesToday || 0,
      icon: MessageSquare,
      change: "+15% from yesterday",
      changeType: "positive" as const,
      color: "bg-secondary/10 text-secondary",
    },
    {
      title: "Completed Orders",
      value: stats?.completedOrders || 0,
      icon: CheckCircle,
      change: "+3 this week",
      changeType: "positive" as const,
      color: "bg-success/10 text-success",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className={`w-4 h-4 mr-1 ${
                stat.changeType === 'positive' ? 'text-success' : 
                stat.changeType === 'negative' ? 'text-red-500' : 'text-slate-400'
              }`} />
              <span className={`text-sm ${
                stat.changeType === 'positive' ? 'text-success' : 
                stat.changeType === 'negative' ? 'text-red-500' : 'text-slate-500'
              }`}>
                {stat.change}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
