import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Calendar, Package, Clock, AlertTriangle } from "lucide-react";
import CommentSystem from "./comment-system";
import FileUpload from "./file-upload";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ProjectModalProps {
  projectId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectModal({ projectId, isOpen, onClose }: ProjectModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  const { data: project, isLoading } = useQuery({
    queryKey: ["/api/projects", projectId],
    enabled: !!projectId && isOpen,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, progress }: { status: string; progress: number }) => {
      const response = await apiRequest("PATCH", `/api/projects/${projectId}/status`, {
        status,
        progress,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      queryClient.invalidateQueries({ queryKey: ["/api/activity"] });
      toast({
        title: "Status Updated",
        description: "Project status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update project status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = () => {
    if (!selectedStatus || !project) return;

    // Calculate progress based on status
    const progressMap = {
      design: 20,
      production: 60,
      quality_check: 80,
      shipping: 90,
      completed: 100,
    };

    const progress = progressMap[selectedStatus as keyof typeof progressMap] || project.progress;

    updateStatusMutation.mutate({ status: selectedStatus, progress });
  };

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-warning";
      case "medium":
        return "text-slate-900";
      case "low":
        return "text-slate-600";
      default:
        return "text-slate-900";
    }
  };

  if (!project && !isLoading) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-slate-200 rounded"></div>
            </div>
          </div>
        ) : project ? (
          <>
            {/* Modal Header */}
            <DialogHeader className="p-6 border-b border-slate-200 sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-xl font-semibold text-slate-900">
                    {project.name}
                  </DialogTitle>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge className={getStatusColor(project.status)}>
                      {project.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <span className="text-sm text-slate-600">{project.buyerName}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
              {/* Project Details */}
              <div className="lg:col-span-2 p-6 overflow-y-auto">
                <div className="space-y-6">
                  {/* Project Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <span>Project Details</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-600">Deadline:</span>
                            <span className="text-slate-900">
                              {project.deadline ? new Date(project.deadline).toLocaleDateString() : "Not set"}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Package className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-600">Quantity:</span>
                            <span className="text-slate-900">
                              {project.quantity ? `${project.quantity.toLocaleString()} units` : "Not specified"}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-600">Started:</span>
                            <span className="text-slate-900">
                              {new Date(project.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-600">Priority:</span>
                            <span className={getPriorityColor(project.priority)}>
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

                  {/* Status Update */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Update Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-3">
                        <Select
                          value={selectedStatus || project.status}
                          onValueChange={setSelectedStatus}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="design">Design Review</SelectItem>
                            <SelectItem value="production">Production</SelectItem>
                            <SelectItem value="quality_check">Quality Check</SelectItem>
                            <SelectItem value="shipping">Shipping</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={handleStatusUpdate}
                          disabled={!selectedStatus || selectedStatus === project.status || updateStatusMutation.isPending}
                        >
                          {updateStatusMutation.isPending ? "Updating..." : "Update"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Comments Section */}
              <div className="lg:col-span-1 border-l border-slate-200">
                <CommentSystem
                  projectId={project.id}
                  comments={project.comments || []}
                  currentUser={user}
                />
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
