
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import NewOrder from "@/pages/new-order";
import OrderDetail from "@/pages/order-detail";
import SendUpdate from "@/pages/send-update";

function Router() {
  return (
    <Switch>
      <Route path="/" component={NewOrder} />
      <Route path="/new" component={NewOrder} />
      <Route path="/order/:id" component={OrderDetail} />
      <Route path="/update" component={SendUpdate} />
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
