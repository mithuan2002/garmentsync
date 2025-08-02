import { Link, useLocation } from "wouter";
import { Bell, Package, Image, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();

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
        {children}
      </main>
    </div>
  );
}