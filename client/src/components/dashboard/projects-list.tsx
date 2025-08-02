import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Calendar, User, MessageSquare, ChevronRight } from "lucide-react";
import { Link } from "wouter";

export default function ProjectsList() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ["/api/projects"],
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
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-slate-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "design":
        return "bg-blue-100 text-blue-700";
      case "production":
        return "bg-warning/10 text-warning";
      case "quality_check":
        return "bg-success/10 text-success";
      case "shipping":
        return "bg-purple-100 text-purple-700";
      case "completed":
        return "bg-success/10 text-success";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-success";
    if (progress >= 50) return "bg-primary";
    return "bg-warning";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Active Projects</CardTitle>
            <p className="text-sm text-slate-600 mt-1">Track your ongoing orders and their status</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        <div className="flex space-x-6 mt-6">
          <button className="text-primary font-medium border-b-2 border-primary pb-2">
            All Projects
          </button>
          <button className="text-slate-600 hover:text-slate-900 transition-colors pb-2">
            In Progress
          </button>
          <button className="text-slate-600 hover:text-slate-900 transition-colors pb-2">
            Review
          </button>
          <button className="text-slate-600 hover:text-slate-900 transition-colors pb-2">
            Completed
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-slate-200">
          {projects?.map((project: any) => (
            <Link 
              key={project.id} 
              href={`/projects/${project.id}`}
              className="block"
            >
              <div className="p-6 hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-slate-900">{project.name}</h3>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{project.description}</p>
                    
                    <div className="flex items-center space-x-6 text-xs text-slate-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          Due {project.deadline ? new Date(project.deadline).toLocaleDateString() : "Not set"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{project.buyerName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{project.comments?.length || 0} messages</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {projects && projects.length === 0 && (
          <div className="p-6 text-center text-slate-500">
            <p>No projects found. Create your first project to get started.</p>
          </div>
        )}

        <div className="p-6 border-t border-slate-200 text-center">
          <button className="text-primary hover:text-blue-700 font-medium text-sm">
            View All Projects →
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
