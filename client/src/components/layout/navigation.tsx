import { Bell, ChevronDown, Shirt, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface NavigationProps {
  user?: any;
}

export default function Navigation({ user }: NavigationProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shirt className="text-white w-4 h-4" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">GarmentSync</h1>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-primary font-medium border-b-2 border-primary pb-4">
              Dashboard
            </a>
            <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">
              Projects
            </a>
            <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">
              Messages
            </a>
            <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">
              Files
            </a>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-3 h-3 p-0 bg-red-500">
                <span className="sr-only">New notifications</span>
              </Badge>
            </Button>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-900">
                  {user?.name || "Loading..."}
                </p>
                <p className="text-xs text-slate-500">
                  {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ""}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
