import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Send, CheckCircle, Package } from "lucide-react";

const updateSchema = z.object({
  orderId: z.string().min(1, "Please select an order"),
  message: z.string().min(1, "Update message is required"),
  authorName: z.string().min(1, "Name is required"),
  authorRole: z.enum(['manufacturer', 'buyer']),
});

type UpdateFormData = z.infer<typeof updateSchema>;

interface Order {
  id: string;
  buyerName: string;
  styleNumber: string;
  status: string;
}

export default function SendUpdate() {
  const [updateSent, setUpdateSent] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UpdateFormData>({
    resolver: zodResolver(updateSchema),
  });

  const selectedOrderId = watch("orderId");

  const sendUpdateMutation = useMutation({
    mutationFn: async (data: UpdateFormData) => {
      const response = await apiRequest("POST", `/api/orders/${data.orderId}/updates`, {
        message: data.message,
        authorName: data.authorName,
        authorRole: data.authorRole,
      });
      return response.json();
    },
    onSuccess: () => {
      setUpdateSent(true);
      reset();
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Update Sent",
        description: "Your update has been sent successfully.",
      });
      
      // Reset success message after 3 seconds
      setTimeout(() => setUpdateSent(false), 3000);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send update. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateFormData) => {
    sendUpdateMutation.mutate(data);
  };

  const selectedOrder = orders?.find(order => order.id === selectedOrderId);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <Send className="w-12 h-12 mx-auto text-primary mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Send Update</h1>
          <p className="text-slate-600">Send a progress update to the buyer</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Update</CardTitle>
          </CardHeader>
          <CardContent>
            {updateSent && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-green-800 font-medium">Update sent successfully!</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="order-select">Choose Order</Label>
                <Select
                  onValueChange={(value) => setValue("orderId", value)}
                  {...register("orderId")}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select an order" />
                  </SelectTrigger>
                  <SelectContent>
                    {orders?.map((order) => (
                      <SelectItem key={order.id} value={order.id}>
                        {order.id} - {order.buyerName} ({order.styleNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.orderId && (
                  <p className="text-sm text-red-500 mt-1">{errors.orderId.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="authorName">Your Name</Label>
                  <Input
                    id="authorName"
                    {...register("authorName")}
                    placeholder="Enter your name"
                    className="mt-1"
                  />
                  {errors.authorName && (
                    <p className="text-sm text-red-500 mt-1">{errors.authorName.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="role-select">Your Role</Label>
                  <Select onValueChange={(value) => setValue("authorRole", value as "manufacturer" | "buyer")}>
                    <SelectTrigger className="mt-1">
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

              {selectedOrder && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <Package className="w-5 h-5 text-slate-600" />
                    <h3 className="font-medium text-slate-900">Selected Order</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Order ID:</span>
                      <span className="text-slate-900 ml-2 font-medium">{selectedOrder.id}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Buyer:</span>
                      <span className="text-slate-900 ml-2">{selectedOrder.buyerName}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Style:</span>
                      <span className="text-slate-900 ml-2">{selectedOrder.styleNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Status:</span>
                      <span className="text-slate-900 ml-2 capitalize">{selectedOrder.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="message">Update Message</Label>
                <Textarea
                  id="message"
                  {...register("message")}
                  placeholder="Enter your update message here..."
                  rows={6}
                  className="mt-1"
                />
                {errors.message && (
                  <p className="text-sm text-red-500 mt-1">{errors.message.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={sendUpdateMutation.isPending}
              >
                {sendUpdateMutation.isPending ? "Sending Update..." : "Send Update"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <a
            href="/new"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            ← Create New Order
          </a>
        </div>
      </div>
    </div>
  );
}