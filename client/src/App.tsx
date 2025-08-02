
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import NewOrder from "@/pages/new-order";
import OrderDetail from "@/pages/order-detail";
import SendUpdate from "@/pages/send-update";
import Notifications from "@/pages/notifications";
import Media from "@/pages/media";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/orders" component={Dashboard} />
      <Route path="/new-order" component={NewOrder} />
      <Route path="/order/:id" component={OrderDetail} />
      <Route path="/send-update/:id" component={SendUpdate} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/media" component={Media} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
