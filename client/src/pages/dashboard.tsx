import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Bell, Package, Image, Plus, Search, Clock, User, Calendar, Package2, Mail } from "lucide-react";
import StakeholderManagement from "@/components/stakeholder-management";

interface Order {
  id: string;
  buyerName: string;
  styleNumber: string;
  quantity: number;
  estimatedDelivery: string;
  buyerEmail: string;
  status: string;
  createdAt: string;
  stakeholders?: any[];
}

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location] = useLocation();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const response = await fetch("/api/orders");
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    },
  });

  // Navigation tabs
  const tabs = [
    {
      id: "orders",
      label: "Orders",
      icon: Package,
      path: "/orders",
      description: "Manage orders and stakeholders"
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      path: "/notifications",
      description: "View and respond to notifications"
    },
    {
      id: "media",
      label: "Media",
      icon: Image,
      path: "/media",
      description: "Store and access product media"
    }
  ];

  const isActive = (path: string) => {
    if (path === "/orders") {
      return location === "/" || location === "/orders" || location.startsWith("/order/") || location.startsWith("/new-order");
    }
    return location.startsWith(path);
  };

  const filteredOrders = orders.filter((order: Order) =>
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.styleNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "confirmed":
        return "bg-blue-100 text-blue-700";
      case "in_production":
        return "bg-orange-100 text-orange-700";
      case "quality_check":
        return "bg-purple-100 text-purple-700";
      case "shipped":
        return "bg-green-100 text-green-700";
      case "delivered":
        return "bg-slate-100 text-slate-700";
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-slate-900">GarmentSync</h1>
              <Badge variant="secondary" className="text-xs">Manufacturing Platform</Badge>
            </div>
            
            <Link href="/new-order">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Order
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = isActive(tab.path);
              
              return (
                <Link key={tab.id} href={tab.path}>
                  <div
                    className={`${
                      active
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200 cursor-pointer`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Orders Management</h2>
              <p className="text-slate-600 mt-1">Create orders, manage stakeholders, and track progress</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">{orders.length} total orders</Badge>
              <Link href="/new-order">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Order
                </Button>
              </Link>
            </div>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="w-5 h-5" />
                <span>Search Orders</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <Input
                  placeholder="Search by order ID, buyer name, or style number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package2 className="w-5 h-5" />
                <span>Recent Orders</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12 text-slate-500">Loading orders...</div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Package2 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>No orders found</p>
                  {searchQuery ? (
                    <p className="text-sm mt-2">Try adjusting your search</p>
                  ) : (
                    <Link href="/new-order">
                      <Button className="mt-4">
                        <Plus className="w-4 h-4 mr-2" />
                        Create your first order
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredOrders.map((order: Order) => (
                    <div key={order.id} className="border rounded-lg p-6 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">Order {order.id}</h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <span className="text-sm text-slate-600">Created {formatDate(order.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Link href={`/order/${order.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                          <Link href={`/send-update/${order.id}`}>
                            <Button variant="outline" size="sm">
                              <Mail className="w-4 h-4 mr-2" />
                              Send Update
                            </Button>
                          </Link>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-3">
                          <User className="w-4 h-4 text-slate-500" />
                          <div>
                            <p className="text-sm text-slate-600">Buyer</p>
                            <p className="font-medium text-slate-900">{order.buyerName}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Package2 className="w-4 h-4 text-slate-500" />
                          <div>
                            <p className="text-sm text-slate-600">Style Number</p>
                            <p className="font-medium text-slate-900">{order.styleNumber}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          <div>
                            <p className="text-sm text-slate-600">Delivery</p>
                            <p className="font-medium text-slate-900">{formatDate(order.estimatedDelivery)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Stakeholder Management - Only show for admin users */}
                      <div className="border-t pt-4">
                        <StakeholderManagement 
                          orderId={order.id}
                          stakeholders={order.stakeholders || []}
                          currentUserRole="admin"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}