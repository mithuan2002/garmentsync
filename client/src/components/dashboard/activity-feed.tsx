import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, CheckCircle, Upload, AlertTriangle } from "lucide-react";

export default function ActivityFeed() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["/api/activity"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "comment":
        return { icon: MessageSquare, color: "bg-blue-500" };
      case "status_change":
        return { icon: CheckCircle, color: "bg-green-500" };
      case "file_upload":
        return { icon: Upload, color: "bg-purple-500" };
      default:
        return { icon: AlertTriangle, color: "bg-yellow-500" };
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
        <p className="text-sm text-slate-600">Latest updates and messages</p>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="divide-y divide-slate-200">
          {activities?.map((activity: any) => {
            const { icon: Icon, color } = getActivityIcon(activity.type);
            
            return (
              <div key={activity.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon className="text-white w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900">
                      <span className="font-medium">{activity.userName}</span>{" "}
                      {activity.type === "comment" && "commented on"}
                      {activity.type === "status_change" && "updated status of"}
                      {activity.type === "file_upload" && "uploaded files to"}
                      {" "}
                      <span className="font-medium text-primary">{activity.projectName}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatTimeAgo(activity.createdAt)}
                    </p>
                    {activity.message && (
                      <p className="text-sm text-slate-600 mt-2 italic">"{activity.message}"</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {activities && activities.length === 0 && (
          <div className="p-4 text-center text-slate-500">
            <p>No recent activity</p>
          </div>
        )}

        <div className="p-4 border-t border-slate-200 text-center">
          <button className="text-primary hover:text-blue-700 font-medium text-sm">
            View All Activity →
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
