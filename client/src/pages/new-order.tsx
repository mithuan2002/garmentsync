import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, Link as LinkIcon, Package } from "lucide-react";

const orderSchema = z.object({
  id: z.string().min(1, "Order ID is required"),
  buyerName: z.string().min(1, "Buyer name is required"),
  styleNumber: z.string().min(1, "Style number is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  estimatedDelivery: z.string().min(1, "Estimated delivery date is required"),
  buyerEmail: z.string().email("Valid email is required"),
});

type OrderFormData = z.infer<typeof orderSchema>;

export default function NewOrder() {
  const [orderCreated, setOrderCreated] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: OrderFormData) => {
      const response = await apiRequest("POST", "/api/orders", {
        ...data,
        estimatedDelivery: new Date(data.estimatedDelivery).toISOString(),
      });
      return response.json();
    },
    onSuccess: (order) => {
      setOrderCreated(order.id);
      reset();
      toast({
        title: "Order Created Successfully",
        description: `Order ${order.id} has been created.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OrderFormData) => {
    createOrderMutation.mutate(data);
  };

  const copyLink = () => {
    const link = `${window.location.origin}/order/${orderCreated}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Order timeline link copied to clipboard.",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <Package className="w-12 h-12 mx-auto text-primary mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create New Order</h1>
          <p className="text-slate-600">Enter order details to start tracking</p>
        </div>

        {orderCreated ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">✅ Order Created</h2>
              <p className="text-slate-600 mb-6">Order {orderCreated} has been successfully created.</p>
              
              <div className="bg-slate-100 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">🔗 View Timeline:</span>
                  <Button variant="outline" size="sm" onClick={copyLink}>
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
                <p className="text-sm text-slate-900 mt-2 break-all">
                  {window.location.origin}/order/{orderCreated}
                </p>
              </div>

              <div className="space-y-3">
                <Button onClick={() => setOrderCreated(null)} className="w-full">
                  Create Another Order
                </Button>
                <a
                  href="/update"
                  className="block w-full text-center py-2 px-4 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Send Update to Buyer
                </a>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="id">Order ID</Label>
                    <Input
                      id="id"
                      {...register("id")}
                      placeholder="ORD-001"
                      className="mt-1"
                    />
                    {errors.id && (
                      <p className="text-sm text-red-500 mt-1">{errors.id.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="buyerName">Buyer Name</Label>
                    <Input
                      id="buyerName"
                      {...register("buyerName")}
                      placeholder="Fashion Company Inc."
                      className="mt-1"
                    />
                    {errors.buyerName && (
                      <p className="text-sm text-red-500 mt-1">{errors.buyerName.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="styleNumber">Style Number</Label>
                    <Input
                      id="styleNumber"
                      {...register("styleNumber")}
                      placeholder="SS24-001"
                      className="mt-1"
                    />
                    {errors.styleNumber && (
                      <p className="text-sm text-red-500 mt-1">{errors.styleNumber.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      {...register("quantity", { valueAsNumber: true })}
                      placeholder="1000"
                      className="mt-1"
                    />
                    {errors.quantity && (
                      <p className="text-sm text-red-500 mt-1">{errors.quantity.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="estimatedDelivery">Estimated Delivery Date</Label>
                    <Input
                      id="estimatedDelivery"
                      type="date"
                      {...register("estimatedDelivery")}
                      className="mt-1"
                    />
                    {errors.estimatedDelivery && (
                      <p className="text-sm text-red-500 mt-1">{errors.estimatedDelivery.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="buyerEmail">Buyer Email</Label>
                    <Input
                      id="buyerEmail"
                      type="email"
                      {...register("buyerEmail")}
                      placeholder="orders@company.com"
                      className="mt-1"
                    />
                    {errors.buyerEmail && (
                      <p className="text-sm text-red-500 mt-1">{errors.buyerEmail.message}</p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createOrderMutation.isPending}
                >
                  {createOrderMutation.isPending ? "Creating Order..." : "Create Order"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}