import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/lib/store";
import { Layout } from "@/components/Layout";
import Landing from "@/pages/Landing";
import Browse from "@/pages/Browse";
import Messages from "@/pages/Messages";
import NotFound from "@/pages/not-found";

function PrivateRouter() {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Landing />;
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Browse} />
        <Route path="/messages" component={Messages} />
        <Route path="/profile" component={() => <div className="p-10 text-center text-muted-foreground">Profile Settings Placeholder</div>} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="font-sans text-foreground bg-background min-h-screen">
          <Switch>
             <Route path="/landing" component={Landing} />
             {/* All other routes go to PrivateRouter which handles auth check */}
             <Route path="/:rest*" component={PrivateRouter} />
          </Switch>
          <Toaster />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
