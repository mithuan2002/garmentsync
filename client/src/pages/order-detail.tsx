import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, Package2, Mail, User, Clock, MessageSquare, Send } from "lucide-react";
import StakeholderManagement from "@/components/stakeholder-management";

interface OrderData {
  id: string;
  buyerName: string;
  styleNumber: string;
  quantity: number;
  estimatedDelivery: string;
  buyerEmail: string;
  status: string;
  createdAt: string;
  updates: UpdateData[];
  comments: CommentData[];
  stakeholders: StakeholderData[];
}

interface UpdateData {
  id: string;
  message: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
}

interface CommentData {
  id: string;
  message: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
}

interface StakeholderData {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string;
  createdAt: string;
}

const commentSchema = z.object({
  message: z.string().min(1, "Comment is required"),
  authorName: z.string().min(1, "Name is required"),
  authorRole: z.enum(['manufacturer', 'buyer']),
});

type CommentFormData = z.infer<typeof commentSchema>;

export default function OrderDetail() {
  const [, params] = useRoute("/order/:id");
  const orderId = params?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery<OrderData>({
    queryKey: ["/api/orders", orderId],
    enabled: !!orderId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  });

  const addCommentMutation = useMutation({
    mutationFn: async (data: CommentFormData) => {
      const response = await apiRequest("POST", `/api/orders/${orderId}/comments`, data);
      return response.json();
    },
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ["/api/orders", orderId] });
      toast({
        title: "Comment Added",
        description: "Your comment has been posted successfully.",
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

  const onSubmitComment = (data: CommentFormData) => {
    addCommentMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Order Not Found</h1>
          <p className="text-slate-600">The order you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received":
        return "bg-blue-100 text-blue-700";
      case "in_production":
        return "bg-yellow-100 text-yellow-700";
      case "quality_check":
        return "bg-purple-100 text-purple-700";
      case "shipped":
        return "bg-green-100 text-green-700";
      case "delivered":
        return "bg-green-100 text-green-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Order {order.id}</h1>
          <div className="flex items-center space-x-4">
            <Badge className={getStatusColor(order.status)}>
              {order.status.replace('_', ' ').toUpperCase()}
            </Badge>
            <span className="text-slate-600">Created {formatDate(order.createdAt)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Stakeholder Management */}
            <StakeholderManagement 
              orderId={order.id}
              stakeholders={order.stakeholders || []}
              currentUserRole="admin" // This should come from user context
            />

            {/* Order Details */}</div>
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-600">Buyer</p>
                      <p className="font-medium text-slate-900">{order.buyerName}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Package2 className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-600">Style Number</p>
                      <p className="font-medium text-slate-900">{order.styleNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Package2 className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-600">Quantity</p>
                      <p className="font-medium text-slate-900">{order.quantity.toLocaleString()} units</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-600">Estimated Delivery</p>
                      <p className="font-medium text-slate-900">{formatDate(order.estimatedDelivery)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 md:col-span-2">
                    <Mail className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-600">Buyer Email</p>
                      <p className="font-medium text-slate-900">{order.buyerEmail}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Comment Form */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Add Comment</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmitComment)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        {...register("authorName")}
                        placeholder="Your name"
                        className="w-full"
                      />
                      {errors.authorName && (
                        <p className="text-sm text-red-500 mt-1">{errors.authorName.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Select onValueChange={(value) => setValue("authorRole", value as "manufacturer" | "buyer")}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manufacturer">Manufacturer</SelectItem>
                          <SelectItem value="buyer">Buyer</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.authorRole && (
                        <p className="text-sm text-red-500 mt-1">{errors.authorRole.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Textarea
                      {...register("message")}
                      placeholder="Add your comment..."
                      rows={3}
                      className="w-full"
                    />
                    {errors.message && (
                      <p className="text-sm text-red-500 mt-1">{errors.message.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={addCommentMutation.isPending}
                    className="w-full"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {addCommentMutation.isPending ? "Adding Comment..." : "Add Comment"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Communication Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(() => {
                    // Combine updates and comments, then sort by date
                    const allActivity = [
                      ...(order.updates || []).map(update => ({
                        ...update,
                        type: 'update' as const,
                      })),
                      ...(order.comments || []).map(comment => ({
                        ...comment,
                        type: 'comment' as const,
                      })),
                    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                    return allActivity.length > 0 ? (
                      allActivity.map((item) => (
                        <div key={item.id} className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            item.type === 'update' ? 'bg-blue-500' : 'bg-green-500'
                          }`}></div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                item.type === 'update' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {item.type === 'update' ? 'Update' : 'Comment'}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                item.authorRole === 'manufacturer'
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-orange-100 text-orange-700'
                              }`}>
                                {item.authorRole}
                              </span>
                            </div>
                            <p className="text-sm text-slate-900">{item.message}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <p className="text-xs font-medium text-slate-700">{item.authorName}</p>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <p className="text-xs text-slate-500">{formatDateTime(item.createdAt)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                        <p className="text-slate-500">No communication yet</p>
                      </div>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}