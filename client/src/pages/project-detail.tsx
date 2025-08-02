import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/layout/navigation";
import CommentSystem from "@/components/project/comment-system";
import FileUpload from "@/components/project/file-upload";
import { Progress } from "@/components/ui/progress";

export default function ProjectDetail() {
  const [, params] = useRoute("/projects/:id");
  const projectId = params?.id;

  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  const { data: project, isLoading } = useQuery({
    queryKey: ["/api/projects", projectId],
    enabled: !!projectId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation user={user} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation user={user} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Project Not Found</h1>
            <Button onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const statusColor = {
    design: "bg-blue-100 text-blue-700",
    production: "bg-warning/10 text-warning",
    quality_check: "bg-success/10 text-success",
    shipping: "bg-purple-100 text-purple-700",
    completed: "bg-success/10 text-success",
  }[project.status] || "bg-slate-100 text-slate-700";

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation user={user} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
              <div className="flex items-center space-x-4 mt-2">
                <Badge className={statusColor}>
                  {project.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <span className="text-slate-600">{project.buyerName}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Deadline:</span>
                      <span className="text-slate-900 ml-2">
                        {project.deadline ? new Date(project.deadline).toLocaleDateString() : "Not set"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600">Quantity:</span>
                      <span className="text-slate-900 ml-2">
                        {project.quantity ? `${project.quantity.toLocaleString()} units` : "Not specified"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600">Started:</span>
                      <span className="text-slate-900 ml-2">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600">Priority:</span>
                      <span className={`ml-2 ${project.priority === 'high' ? 'text-warning' : 'text-slate-900'}`}>
                        {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {project.description && (
                  <div className="mt-4">
                    <h4 className="font-medium text-slate-900 mb-2">Description</h4>
                    <p className="text-slate-700">{project.description}</p>
                  </div>
                )}

                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* File Attachments */}
            <Card>
              <CardHeader>
                <CardTitle>Attachments</CardTitle>
              </CardHeader>
              <CardContent>
                <FileUpload projectId={project.id} files={project.files || []} />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <CommentSystem 
              projectId={project.id} 
              comments={project.comments || []} 
              currentUser={user}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
