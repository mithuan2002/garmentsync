import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Paperclip } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  message: string;
  author: string;
  role: string;
  createdAt: string;
}

interface CommentSystemProps {
  projectId: string;
  comments: Comment[];
  currentUser?: any;
}

export default function CommentSystem({ projectId, comments, currentUser }: CommentSystemProps) {
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addCommentMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/comments`, {
        message,
      });
      return response.json();
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      toast({
        title: "Comment Added",
        description: "Your comment has been posted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addCommentMutation.mutate(newComment.trim());
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "manufacturer":
        return "bg-purple-500";
      case "buyer":
        return "bg-blue-500";
      default:
        return "bg-green-500";
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Comments</CardTitle>
        <p className="text-sm text-slate-600">Discuss project details</p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Comments List */}
        <div className="flex-1 space-y-4 mb-6 max-h-96 overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start space-x-3">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className={getRoleColor(comment.role)}>
                  <User className="w-4 h-4 text-white" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-sm text-slate-900">{comment.author}</span>
                  <span className="text-xs text-slate-500 capitalize">{comment.role}</span>
                  <span className="text-xs text-slate-500">{formatTimeAgo(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-slate-700">{comment.message}</p>
              </div>
            </div>
          ))}

          {comments.length === 0 && (
            <div className="text-center text-slate-500 py-8">
              <p>No comments yet. Start the conversation!</p>
            </div>
          )}
        </div>

        {/* Comment Input */}
        <form onSubmit={handleSubmit} className="border-t border-slate-200 pt-4">
          <div className="flex space-x-3">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="bg-secondary">
                <User className="w-4 h-4 text-white" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="resize-none"
                rows={3}
              />
              <div className="flex items-center justify-between mt-2">
                <Button type="button" variant="ghost" size="sm">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={!newComment.trim() || addCommentMutation.isPending}
                >
                  {addCommentMutation.isPending ? "Sending..." : "Send"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
