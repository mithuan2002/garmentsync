import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/layout/navigation";
import StatsCards from "@/components/dashboard/stats-cards";
import ProjectsList from "@/components/dashboard/projects-list";
import ActivityFeed from "@/components/dashboard/activity-feed";
import QuickActions from "@/components/dashboard/quick-actions";

export default function Dashboard() {
  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation user={user} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsCards />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ProjectsList />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <ActivityFeed />
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
}
