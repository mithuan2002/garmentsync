import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Package2, Mail, User, Clock } from "lucide-react";

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
}

interface UpdateData {
  id: string;
  message: string;
  createdAt: string;
}

export default function OrderDetail() {
  const [, params] = useRoute("/order/:id");
  const orderId = params?.id;

  const { data: order, isLoading } = useQuery<OrderData>({
    queryKey: ["/api/orders", orderId],
    enabled: !!orderId,
  });

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
            <Card>
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
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.updates && order.updates.length > 0 ? (
                    order.updates.map((update) => (
                      <div key={update.id} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-sm text-slate-900">{update.message}</p>
                          <div className="flex items-center space-x-1 mt-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <p className="text-xs text-slate-500">{formatDateTime(update.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-slate-500">No updates yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}